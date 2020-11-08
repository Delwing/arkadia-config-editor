const { remote, ipcRenderer } = require('electron')
const FindInPage = require('electron-find')
const { ConfigLoader } = require('./config')


let findInPage = new FindInPage.FindInPage(
    remote.getCurrentWebContents(), {
    preload: true,
    parentElement: document.querySelector('#editor-holder')
})

ipcRenderer.on('on-find', (e, args) => {
    findInPage.openFindWindow()
})

ipcRenderer.send('variable-request');
ipcRenderer.on('variable-reply', function (event, ...args) {
    new ConfigLoader(args[0], args[1]).load()
});

document.getElementById("filter-entries").addEventListener("input", function (e) {
    document.querySelectorAll("#entries-index li").forEach(element => {
        let text = e.target.value
        element.style.display = (element.innerHTML.match(text) || text.value === "") ? 'block' : 'none'
    })
})