import { app, ipcMain } from 'electron'
import path from 'path'
import { accessSync, readdirSync } from 'node:fs'
import { ConfigLoader } from '../config-loader'

ipcMain.handle('app:get-mudlet-profiles', async () => {
  const mudletProfilesDirectory = path.join(app.getPath('home'), '.config/mudlet/profiles')
  return Promise.all(
    readdirSync(mudletProfilesDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .filter((dirent) => {
        const basePath = path.join(mudletProfilesDirectory, dirent.name, 'arkadia')
        try {
          accessSync(path.join(basePath, 'config_schema.json'))
          accessSync(path.join(basePath, 'config.md'))
          return true
        } catch (e) {
          return false
        }
      })
      .map((dirent) => path.join(dirent.path, dirent.name))
      .map((dir) => readdirSync(dir, { withFileTypes: true }))
      .flatMap((dir) => dir)
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.json'))
      .map((dirent) => path.join(dirent.path, dirent.name))
      .map((dirent) => new ConfigLoader(dirent).load())
  ).then((result) => result.filter((cfg) => cfg.isValid).map((cfg) => cfg.path))
})
