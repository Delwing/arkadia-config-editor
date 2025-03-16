import { app, shell, BrowserWindow, nativeTheme, screen, Menu, dialog, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createMenu from './menu'
import { clearConfig, isConfigOpened, loadConfig, reloadConfig } from './handlers/load-config'
import './handlers/theme-handlers'
import './handlers/recent-documents'
import './handlers/pick-file'
import './handlers/get-mudlet-profiles'
import './handlers/open-file'
import './handlers/settings-handlers'
import { registerSearchHandlersForWindow } from './handlers/search'
import settings from 'electron-settings'

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
    Menu.setApplicationMenu(createMenu(mainWindow, isConfigOpened()))
  } else {
    mainWindow.setMenu(createMenu(mainWindow, isConfigOpened()))
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  registerSearchHandlersForWindow(mainWindow)

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('pl.nullpointer.arkadia-cfg-editor')

  nativeTheme.themeSource = (settings.getSync('themeSource') as 'system' | 'light' | 'dark') ?? 'system'

  let hasPendingChanges = false

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

    if (process.argv[2] !== undefined && process.argv[3] !== undefined) {
      loadConfig(mainWindow.webContents, path.join(process.argv[2], process.argv[3] + '.json'))
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  nativeTheme.on('updated', () => {
    mainWindow.webContents.send('theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
    settings.set('themeSource', nativeTheme.themeSource)
  })

  app.on('open-file', (_, path) => {
    loadConfig(mainWindow.webContents, path)
  })

  // @ts-ignore
  ipcMain.on('configStateChange', (isConfigOpened: boolean) => {
    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(createMenu(mainWindow, isConfigOpened))
    } else {
      mainWindow.setMenu(createMenu(mainWindow, isConfigOpened))
    }
  })

  ipcMain.on('pendingChanges', (_, pendingChanges: boolean) => {
    hasPendingChanges = pendingChanges
  })

  ipcMain.on('reloadFile', () => {
    if (!hasPendingChanges) {
      reloadConfig(mainWindow.webContents)
      return
    }
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Przeładuj', 'Anuluj'],
      title: 'Masz niezapisane zmiany',
      message: 'Czy na pewno chcesz przeładować plik?'
    })
    if (choice === 1) {
      reloadConfig(mainWindow.webContents)
    }
    return
  })

  function closeFile() {
    mainWindow.webContents.send('close')
    clearConfig()
    hasPendingChanges = false
  }

  ipcMain.on('closeFile', () => {
    if (!hasPendingChanges) {
      closeFile()
      return
    }
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Zapisz i zamknij', 'Zamknij', 'Anuluj'],
      title: 'Masz niezapisane zmiany',
      message: 'Czy na pewno chcesz zamknąć plik?'
    })
    if (choice === 0) {
      ipcMain.once('fileSaved', () => {
        closeFile()
      })
      mainWindow.webContents.send('save')
    }
    if (choice === 1) {
      closeFile()
    }
    return
  })

  mainWindow.on('close', function (e) {
    if (!hasPendingChanges) {
      return
    }
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Zapisz i wyjdź', 'Wyjdź', 'Anuluj'],
      title: 'Masz niezapisane zmiany',
      message: 'Czy na pewno chcesz wyjść?'
    })
    if (choice === 0) {
      ipcMain.on('fileSaved', () => {
        hasPendingChanges = false
        app.quit()
      })
      mainWindow.webContents.send('save')
      e.preventDefault()
    }
    if (choice === 2) {
      e.preventDefault()
    }
  })
})
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})
