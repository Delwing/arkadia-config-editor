import settings from 'electron-settings'
import { BrowserWindow, ipcMain, Menu, nativeTheme } from 'electron'
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions

import fs from 'fs'
import path from 'path'

let currentTheme = settings.getSync('theme.bootstrap') ?? 'sandstone'

export default function createMenu(mainWindow: BrowserWindow): Menu {
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
          mainWindow.webContents.send('theme:bootstrap', theme)
          settings.set('theme.bootstrap', theme)
        },
        checked: currentTheme == theme
      })
    )

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Plik',
      submenu: [
        {
          label: 'Zapisz',
          click: function (): void {
            mainWindow.webContents.send('save')
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S'
        },
        {
          label: 'Otwórz',
          click: function (): void {
            ipcMain.emit('open')
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O'
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
        }
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
          role: "about"
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
