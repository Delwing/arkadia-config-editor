import settings from 'electron-settings'
import { ipcMain } from 'electron'

ipcMain.handle('app:recentDocuments', () => {
  return settings.getSync('app:recentDocuments') ?? []
})
