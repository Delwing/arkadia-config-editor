import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ConfigResponse } from '../shared/src/Config'

type ConfigCallback = (config: ConfigResponse) => void

export interface CfgApi {
  onConfig(callback: ConfigCallback): () => void

  openConfig(): void

  onThemeChange(callback: (theme: 'dark' | 'light') => void): () => void
  onBootThemeChange(callback: (theme: string) => void): () => void
}

//eslint-disable-next-line
function wrap(channel: string, callback: Function): () => void {
  const listener = (_, ...args): void => {
    callback(...args)
  }
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api: CfgApi = {
  onConfig: (callback) => {
    const channel = 'config'
    const listener = (_, config: ConfigResponse): void => {
      callback(config)
    }
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
  openConfig: () => {
    ipcRenderer.send('open')
  },
  onThemeChange: (callback) => wrap('theme', callback),
  onBootThemeChange: (callback) => wrap('bootTheme', callback)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
