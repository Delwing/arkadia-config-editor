import { app, shell, BrowserWindow, nativeTheme, screen, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createMenu from './menu'
import { loadConfig } from './handlers/load-config'
import './handlers/theme-handlers'
import './handlers/recent-documents'
import './handlers/pick-file'
import { registerSearchHandlersForWindow } from './handlers/search'

function createWindow(): BrowserWindow {
  const screenSize = screen.getPrimaryDisplay().bounds
  const factor = 0.8
  const mainWindow = new BrowserWindow({
    width: screenSize.width * factor,
    height: screenSize.height * factor,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
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

  registerSearchHandlersForWindow(mainWindow)

  return mainWindow
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
