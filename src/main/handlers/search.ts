import {ipcMain} from "electron";

ipcMain.handle('app:search:start', (event, value) => {
  event.sender.findInPage(value)
})

ipcMain.handle('app:search:stop', (event) => {
  event.sender.stopFindInPage('clearSelection')
})
