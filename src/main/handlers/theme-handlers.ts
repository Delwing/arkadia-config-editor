import settings from "electron-settings";
import {ipcMain} from "electron";

ipcMain.handle('theme:bootstrap', () => {
  return settings.getSync('theme.bootstrap')
})
