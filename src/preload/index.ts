import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Config, ConfigResponse } from '../shared/Config'

type ConfigCallback = (config: ConfigResponse) => void

export interface CfgApi {
  onConfig(callback: ConfigCallback): () => void

  openConfig(recentFile?: string): void

  saveConfig(file: string, config: Config): Promise<void>

  onRequestSave(callback: () => void): () => void

  onThemeChange(callback: (theme: 'dark' | 'light') => void): () => void
  onBootThemeChange(callback: (theme: string) => void): () => void

  getTheme(): Promise<{ theme: string; isDark: boolean }>

  getRecent(): Promise<string[]>

  getFilePath(context: string, extensions?: string[]): Promise<string>

  search(search: string): Promise<number>

  clearSearch(): Promise<void>

  stopSearch(): Promise<void>

  searchNext(): Promise<void>

  searchPrev(): Promise<void>

  listenToSearch(callback: (result: Electron.Result) => void): () => void

  onAbout(callback: (version: string) => void): () => void
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
  openConfig: (filePath) => {
    ipcRenderer.send('open', filePath)
  },
  onRequestSave: (callback) => wrap('save', callback),
  saveConfig(file: string, config: Config): Promise<void> {
    return ipcRenderer.invoke('save', file, config)
  },
  onThemeChange: (callback) => wrap('theme', callback),
  onBootThemeChange: (callback) => wrap('theme:bootstrap', callback),
  getTheme: () => ipcRenderer.invoke('theme'),
  getRecent: () => ipcRenderer.invoke('app:recentDocuments'),
  getFilePath: (context: string, extensions?: string[]): Promise<string> =>
    ipcRenderer.invoke('app:file-pick', context, extensions),
  onAbout: (callback) => wrap("about", callback),
  search: (value: string) => ipcRenderer.invoke('app:search:start', value),
  clearSearch: () => ipcRenderer.invoke('app:search:clear'),
  stopSearch: () => ipcRenderer.invoke('app:search:stop'),
  searchNext: () => ipcRenderer.invoke('app:search:next'),
  searchPrev: () => ipcRenderer.invoke('app:search:prev'),
  listenToSearch: (callback) => {
    const channel = 'app:search:found'
    const listener = (_, result: Electron.Result): void => {
      callback(result)
    }
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  }
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
