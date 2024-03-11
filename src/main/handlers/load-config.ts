import path from "path";
import {app, dialog, ipcMain} from "electron";
import settings from "electron-settings";
import {ConfigLoader} from "../config-loader";
import WebContents = Electron.WebContents;
ipcMain.on('open', async (event, fileToOpen) => {
  const filePath = fileToOpen ?? (await dialog
    .showOpenDialog({
      defaultPath: path.resolve(`${app.getPath('home')}/.config/mudlet/profiles`),
      securityScopedBookmarks: true,
      filters: [
        {name: 'Konfiguracje', extensions: ['json']},
        {name: 'Wszystkie pliki', extensions: ['*']}
      ]
    })).filePaths[0];

  if (filePath) {
    loadConfig(event.sender, filePath)
  }
})

export function loadConfig(target: WebContents, path: string): void {
  settings.get('app:recentDocuments').then((recent) => {
    settings.set('app:recentDocuments', [...(recent as [string[]] ?? [])].concat([path]).filter((value, index, array) => array.indexOf(value) === index))
  })
  const loader = new ConfigLoader(path)
  loader.load().then((fields) => {
    target.send('config', fields)
  })
}
