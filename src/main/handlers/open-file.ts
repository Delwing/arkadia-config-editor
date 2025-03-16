import { ipcMain, shell } from 'electron'
import path from 'path'

ipcMain.handle('app:open-in-explorer', (_, cfgPath: string) => {
  shell.openPath(cfgPath.substring(0, cfgPath.lastIndexOf(path.sep)))
});
