// Mock implementation of the preload API for running the renderer in a browser
import type { Config, ConfigResponse, Field, FieldDefinition } from '../shared/Config'
import type { CfgApi } from '../preload/index'

if (!(window as any).api) {
  type Unsubscribe = () => void
  function createEmitter<T extends (...args: any[]) => void>() {
    const listeners: T[] = []
    return {
      add(listener: T): Unsubscribe {
        listeners.push(listener)
        return () => {
          const idx = listeners.indexOf(listener)
          if (idx !== -1) listeners.splice(idx, 1)
        }
      },
      emit(...args: Parameters<T>): void {
        listeners.forEach((l) => l(...args))
      }
    }
  }

  const configEmitter = createEmitter<(cfg: ConfigResponse) => void>()
  const requestSaveEmitter = createEmitter<() => void>()
  const requestCloseEmitter = createEmitter<() => void>()
  const themeEmitter = createEmitter<(theme: 'dark' | 'light') => void>()
  const bootThemeEmitter = createEmitter<(theme: string) => void>()
  const hljsEmitter = createEmitter<(theme: string) => void>()
  const visualListEmitter = createEmitter<(value: boolean) => void>()
  const withLinesEmitter = createEmitter<(value: boolean) => void>()
  const searchEmitter = createEmitter<(result: Electron.Result) => void>()
  const aboutEmitter = createEmitter<(version: string) => void>()

  const fields: Map<string, Field> = new Map([
    [
      'example.boolean',
      {
        definition: { name: 'example.boolean', default_value: false, field_type: 'boolean' } as FieldDefinition,
        value: true,
        description: 'Przykładowa opcja logiczna'
      }
    ],
    [
      'example.text',
      {
        definition: { name: 'example.text', default_value: '', field_type: 'string' } as FieldDefinition,
        value: 'wartość',
        description: 'Przykładowy tekst'
      }
    ]
  ])

  const mockConfig: ConfigResponse = {
    name: 'Mock profile',
    directory: '/mock',
    path: '/mock/config.json',
    fields,
    hasLoadingTrigger: false,
    isValid: true
  }

  let visualListSetting = false
  let withLinesSetting = false
  const recentDocuments: string[] = ['/mock/config.json']
  const theme = { theme: 'sandstone', isDark: true }
  const hljsTheme = { theme: 'atom-one-dark' }

  let searchState: Electron.Result = { requestId: 0, activeMatchOrdinal: 0, matches: 0 }

  function runSearch(query: string): number {
    const text = JSON.stringify(Array.from(fields.entries()))
    const matches = [...text.matchAll(new RegExp(query, 'gi'))]
    searchState = {
      requestId: 1,
      activeMatchOrdinal: matches.length ? 1 : 0,
      matches: matches.length
    }
    searchEmitter.emit(searchState)
    return matches.length
  }

  const api: CfgApi = {
    onConfig: (cb) => configEmitter.add(cb),
    openConfig: () => configEmitter.emit(mockConfig),
    saveConfig: (_, cfg: Config) => {
      console.log('mock save', cfg)
      localStorage.setItem('mockConfig', JSON.stringify(cfg))
      return Promise.resolve()
    },
    onRequestSave: (cb) => requestSaveEmitter.add(cb),
    onRequestClose: (cb) => requestCloseEmitter.add(cb),
    onThemeChange: (cb) => themeEmitter.add(cb),
    onBootThemeChange: (cb) => bootThemeEmitter.add(cb),
    onHljsThemeChange: (cb) => hljsEmitter.add(cb),
    onVisualListChange: (cb) => visualListEmitter.add(cb),
    onWithLinesChange: (cb) => withLinesEmitter.add(cb),
    getTheme: () => Promise.resolve(theme),
    getHljsTheme: () => Promise.resolve(hljsTheme),
    getVisualListEdit: () => Promise.resolve(visualListSetting),
    getWithLines: () => Promise.resolve(withLinesSetting),
    getRecent: () => Promise.resolve(recentDocuments),
    getFilePath: () => Promise.resolve(''),
    search: (q: string) => Promise.resolve(runSearch(q)),
    clearSearch: () => {
      searchState = { requestId: 0, activeMatchOrdinal: 0, matches: 0 }
      searchEmitter.emit(searchState)
      return Promise.resolve()
    },
    stopSearch: () => {
      searchState = { requestId: 0, activeMatchOrdinal: 0, matches: 0 }
      searchEmitter.emit(searchState)
      return Promise.resolve()
    },
    searchNext: () => {
      if (searchState.matches > 0) {
        searchState.activeMatchOrdinal =
          (searchState.activeMatchOrdinal % searchState.matches) + 1
        searchEmitter.emit(searchState)
      }
      return Promise.resolve()
    },
    searchPrev: () => {
      if (searchState.matches > 0) {
        searchState.activeMatchOrdinal =
          (searchState.activeMatchOrdinal + searchState.matches - 2) % searchState.matches + 1
        searchEmitter.emit(searchState)
      }
      return Promise.resolve()
    },
    listenToSearch: (cb) => searchEmitter.add(cb),
    getConfigs: () => Promise.resolve(recentDocuments),
    openInExplorer: (p: string) => console.log('openInExplorer', p),
    notifyAboutChanges: (v: boolean) => console.log('pendingChanges', v),
    onAbout: (cb) => aboutEmitter.add(cb)
  }

  ;(window as any).api = api
}

export {}
