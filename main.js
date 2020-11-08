// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')


// require('electron-reload')(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`)
// })

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    },
    autoHideMenuBar: true
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('focus', () => {
    globalShortcut.register('CommandOrControl+F', function () {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('on-find', '')
      }
    })
  })
  mainWindow.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+F')
  })

}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') { app.quit() }
  globalShortcut.unregister('CommandOrControl+F')
})

ipcMain.on('variable-request', function (event, arg) {
  event.sender.send('variable-reply', process.argv[2], process.argv[3]);
});