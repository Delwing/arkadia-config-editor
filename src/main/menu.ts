import settings from 'electron-settings'
import { BrowserWindow, Menu, nativeTheme } from 'electron'
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions

import fs from 'fs'
import path from 'path'

const themes = fs
  .readdirSync(path.resolve(__dirname, '../renderer/assets'))
  .filter((file) => file.match('theme'))
  .map((file) => file.substring(file.indexOf('-') + 1))
  .map((file) => file.substring(0, file.indexOf('-')))

let currentTheme = 'sandstone'

export default function createMenu(mainWindow: BrowserWindow): Menu {
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
            mainWindow.webContents.send('open')
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
            mainWindow.webContents.send('on-find')
          }
        }
      ]
    },
    {
      label: 'Opcje',
      submenu: [
        {
          label: 'Wizualna edycja map i list',
          type: 'checkbox',
          click: function (item): void {
            settings.set('visual-edit', item.checked)
          },
          checked: settings.getSync('visual-edit') as boolean
        },
        {
          label: 'Theme',
          submenu: themes.map((theme) => {
            return {
              label: theme,
              type: 'radio',
              click: function (): void {
                currentTheme = theme
                mainWindow.webContents.send('bootTheme', theme)
              },
              checked: currentTheme == theme
            }
          })
        },
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
            }
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
        }
      ]
    }
  ]
  return Menu.buildFromTemplate(template)
}
