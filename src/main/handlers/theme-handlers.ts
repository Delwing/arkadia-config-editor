import settings from 'electron-settings'
import { ipcMain, nativeTheme } from 'electron'

ipcMain.handle('theme', () => {
  return {
    theme: settings.getSync('theme.bootstrap') ?? 'sandstone',
    isDark: nativeTheme.shouldUseDarkColors
  }
})
