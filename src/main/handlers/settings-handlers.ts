import settings from 'electron-settings'
import { ipcMain } from 'electron'

ipcMain.handle('setting', (_, key) => {
  return settings.getSync(key)
})
