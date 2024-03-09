import { app, shell, BrowserWindow, ipcMain, dialog, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createMenu from './menu'
import { ConfigLoader } from './config-loader'
import settings from "electron-settings";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 800,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.setMenu(createMenu(mainWindow))
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    loadConfig('C:\\Users\\delwi\\.config\\mudlet\\profiles\\Delwing\\Delwing.json')
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

  function loadConfig(path: string): void {
    const loader = new ConfigLoader(path)
    loader.load().then((fields) => {
      mainWindow.webContents.send('config', fields)
    })
  }

  ipcMain.on('open', () => {
    dialog
      .showOpenDialog({
        defaultPath: `${app.getPath('home')}\\.config\\mudlet\\profiles`,
        securityScopedBookmarks: true,
        filters: [
          { name: 'Konfiguracje', extensions: ['json'] },
          { name: 'Wszystkie pliki', extensions: ['*'] }
        ]
      })
      .then((result) => {
        if (result.filePaths[0]) {
          loadConfig(result.filePaths[0])
        }
      })
  })
}

app.whenReady().then(() => {
  ipcMain.handle('getTheme', () => {
    return settings.getSync('theme.bootstrap')
  })


  createWindow()
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

