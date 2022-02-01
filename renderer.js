const { remote, ipcRenderer } = require('electron')
const FindInPage = require('electron-find')
const { ConfigLoader } = require('./config')
const dialog = remote.require('electron').dialog;
const createCSSSelector = require("./css")
const mudletColors = require("./colors.json")

function openFile() {
    dialog.showOpenDialog().then(result => { if (result.filePaths[0]) { config.load(result.filePaths[0]) } })
}

let config = new ConfigLoader()

let findInPage = new FindInPage.FindInPage(
    remote.getCurrentWebContents(), {
    preload: true,
    parentElement: document.querySelector('#editor-holder')
})

ipcRenderer.on('on-find', (e, args) => {
    findInPage.openFindWindow()
})

ipcRenderer.on('open', (e, args) =>
    openFile()
)

ipcRenderer.send('variable-request');
ipcRenderer.on('variable-reply', function (event, ...args) {
    if (args[0] && args[1]) {
        config.load(`${args[0]}/${args[1]}.json`)
    } else {
        openFile()
    }
});

document.getElementById("filter-entries").addEventListener("input", function (e) {
    document.querySelectorAll("#entries-index li").forEach(element => {
        let text = e.target.value
        element.style.display = (element.innerHTML.match(text) || text.value === "") ? 'block' : 'none'
    })
})

document.getElementById("load-button").addEventListener("click", openFile)

Object.keys(mudletColors).forEach(value => {
    let color = mudletColors[value];
    let lightness = color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722
    let fg = lightness > 130 ? 'black' : 'white'
    createCSSSelector(`[data-value=${value}]`, `background: rgb(${color[0]}, ${color[1]}, ${color[2]}); color: ${fg};`)
    createCSSSelector(`[data-value=${value}].is-highlighted`, `color: rgb(${color[0]}, ${color[1]}, ${color[2]}); background: ${fg} !important;`)
});
