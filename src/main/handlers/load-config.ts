import path from 'path'
import { app, dialog, ipcMain } from 'electron'
import settings from 'electron-settings'
import { ConfigLoader } from '../config-loader'
import WebContents = Electron.WebContents
import { Config } from '../../shared/Config'
import fs from 'fs'

ipcMain.on('open', async (event, fileToOpen) => {
  const filePath =
    fileToOpen ??
    (
      await dialog.showOpenDialog({
        defaultPath: path.resolve(`${app.getPath('home')}/.config/mudlet/profiles`),
        securityScopedBookmarks: true,
        filters: [
          { name: 'Konfiguracje', extensions: ['json'] },
          { name: 'Wszystkie pliki', extensions: ['*'] }
        ]
      })
    ).filePaths[0]

  if (filePath) {
    loadConfig(event.sender, filePath)
  }
})

ipcMain.handle(
  'save',
  async (_, file: string, config: Config): Promise<void> =>
    new Promise((resolve) => {
      fs.writeFile(file, JSON.stringify(config, null, 4), () => resolve())
    })
)

export function loadConfig(target: WebContents, path: string): void {
  settings.get('app:recentDocuments').then((recent) => {
    settings.set(
      'app:recentDocuments',
      [...((recent as [string[]]) ?? [])]
        .concat([path])
        .filter((value, index, array) => array.indexOf(value) === index)
        .slice(0, 5)
    )
  })
  const loader = new ConfigLoader(path)
  loader.load().then((fields) => {
    target.send('config', fields)
  })
}
