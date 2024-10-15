import path from "path";
import {app, dialog, ipcMain} from "electron";

ipcMain.handle('app:file-pick', async (_, configPath: string, fileTypes: string[]) => {
  const filePath = (await dialog
    .showOpenDialog({
      defaultPath: path.resolve(`${app.getPath('home')}/.config/mudlet/profiles`),
      securityScopedBookmarks: true,
      filters: !fileTypes ? [] : [
        {name: fileTypes.join(","), extensions: fileTypes},
        {name: "Wszystkie pliki", extensions: ['*']}
      ]
    })).filePaths[0];
  if (!filePath) {
    return;
  }
  const relative = path.relative(configPath, filePath);
  return !relative.startsWith("..") ? relative : filePath;
})
