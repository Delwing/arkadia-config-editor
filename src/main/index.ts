import {app, shell, BrowserWindow, nativeTheme, Menu, session} from 'electron'
import {join} from 'path'
import {electronApp, optimizer, is} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createMenu from './menu'
import {loadConfig} from "./handlers/load-config";
import './handlers/theme-handlers'
import './handlers/recent-documents'
import './handlers/pick-file'
import './handlers/search'

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 800,
    show: false,
    ...(process.platform === 'linux' ? {icon} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(createMenu(mainWindow))
  } else {
    mainWindow.setMenu(createMenu(mainWindow))
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('found-in-page', (_, result) => {
    console.log(result)
  })

  return mainWindow;
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('pl.nullpointer.arkadia-cfg-editor')

  const mainWindow = createWindow()
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle(`Arkadia Config Editor ${app.getVersion()}`)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  nativeTheme.on('updated', () => {
    mainWindow.webContents.send('theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
  })

  app.on('open-file', (_, path) => {
    loadConfig(mainWindow.webContents, path)
  })

})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})

import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
// Or if you can not use ES6 imports
/**
 const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
 */
app.whenReady().then(() => {
  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});
