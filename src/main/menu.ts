import settings from 'electron-settings'
import { app, BrowserWindow, ipcMain, Menu, nativeTheme, shell } from 'electron'
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions

import fs from 'fs'
import path from 'path'
import SettingsService, { SETTINGS } from './settings-service'
import { trackEvent } from '@aptabase/electron/main'

let currentTheme = settings.getSync('theme.bootstrap') ?? 'sandstone'
let currentHljsTheme = settings.getSync('theme.hljs')

const settingsService = new SettingsService()

export default function createMenu(mainWindow: BrowserWindow, hasConfigOpened: boolean): Menu {
  const themes = fs
    .readdirSync(path.resolve(__dirname, '../renderer/assets'))
    .filter((file) => file.match('theme'))
    .map((file) => file.substring(file.indexOf('-') + 1))
    .map((file) => file.substring(0, file.indexOf('-')))
    .map(
      (theme): MenuItemConstructorOptions => ({
        label: theme,
        type: 'radio',
        click: (): void => {
          currentTheme = theme
          trackEvent("changeTheme", {
            theme: theme
          })
          mainWindow.webContents.send('theme:bootstrap', theme)
          settings.set('theme.bootstrap', theme)
        },
        checked: currentTheme == theme
      })
    )

  const hljsThemes = fs
    .readdirSync(path.resolve(__dirname, '../../node_modules/highlight.js/scss/'))
    .filter((file) => file.endsWith('.scss'))
    .map((file) => file.substring(0, file.indexOf('.')))
    .map(
      (theme): MenuItemConstructorOptions => ({
        label: theme,
        type: 'radio',
        click: (): void => {
          currentHljsTheme = theme
          mainWindow.webContents.send('theme:hljs', theme)
          settings.set('theme.hljs', theme)
        },
        checked: currentHljsTheme == theme
      })
    )
  hljsThemes.unshift({
    label: 'Domyślny',
    type: 'radio',
    click: (): void => {
      mainWindow.webContents.send('theme:hljs', 'none')
      settings.set('theme.hljs', 'none')
    },
    checked: currentHljsTheme == 'none'
  })

  const appSettings = Object.values(SETTINGS).map(value => {
    return {
      label: value.label,
      type: 'checkbox',
      checked: settingsService.getSetting(value.key) as boolean,
      click: (v) => {
        settingsService.setSetting(value.key, v.checked)
        mainWindow.webContents.send(value.key, v.checked)
      }
    } as MenuItemConstructorOptions
  })

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Plik',
      submenu: [
        {
          label: 'Zapisz',
          click: () => mainWindow.webContents.send('save'),
          accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
          enabled: hasConfigOpened
        },
        {
          label: 'Otwórz',
          click: () => ipcMain.emit('open'),
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O'
        },
        {
          label: 'Przeładuj plik',
          click: () => ipcMain.emit('reloadFile'),
          enabled: hasConfigOpened
        },
        {
          label: 'Zamknij plik',
          click: () => ipcMain.emit('closeFile'),
          enabled: hasConfigOpened
        },
        {
          type: 'separator'
        },
        {
          label: 'Wyjście',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edycja',
      submenu: [
        {
          label: 'Szukaj',
          accelerator: process.platform === 'darwin' ? 'Cmd+F' : 'Ctrl+F',
          click: function (): void {
            ipcMain.emit('app:search:open')
          }
        },
        {
          role: 'selectAll'
        },
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'cut'
        }
      ]
    },
    {
      label: 'Opcje',
      submenu: [
        {
          label: 'Schemat kolorów',
          submenu: [
            {
              label: 'Zgodnie z sytemem',
              type: 'radio',
              click: function (): void {
                nativeTheme.themeSource = 'system'
              },
              checked: nativeTheme.themeSource == 'system'
            },
            {
              label: 'Jasny',
              type: 'radio',
              click: function (): void {
                nativeTheme.themeSource = 'light'
              },
              checked: nativeTheme.themeSource == 'light'
            },
            {
              label: 'Ciemny',
              type: 'radio',
              click: function (): void {
                nativeTheme.themeSource = 'dark'
              },
              checked: nativeTheme.themeSource == 'dark'
            },
            { type: 'separator' },
            ...themes
          ]
        },
        {
          label: 'Schemat kolorów dla kodu',
          submenu: [...hljsThemes]
        },
        ...appSettings
      ]
    },
    {
      label: 'Widok',
      submenu: [
        {
          label: 'Zbliż',
          role: 'zoomIn',
          accelerator: process.platform === 'darwin' ? 'Cmd+=' : 'Ctrl+='
        },
        {
          label: 'Oddal',
          role: 'zoomOut',
          accelerator: process.platform === 'darwin' ? 'Cmd+-' : 'Ctrl+-'
        },
        { type: 'separator' },
        {
          label: 'Pełny ekran',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Pomoc',
      submenu: [
        {
          label: 'Otwórz narzędzia developerskie',
          role: 'toggleDevTools'
        },
        {
            "label": "Github projektu",
            click: () => shell.openExternal('https://github.com/Delwing/arkadia-config-editor')
        },
        {
          label: "O programie",
          click: () => mainWindow.webContents.send("about", app.getVersion())
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
