import { BrowserView, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const width = 300
const height = 100
const padding = 40

class SearchInWindow {
  private readonly parentWindow: BrowserWindow
  private isOpen = false
  private searcher: BrowserView | undefined
  private requestId: number | undefined
  private query: string | undefined
  // private activeIdx
  // private maxIdx

  constructor(window: BrowserWindow) {
    this.parentWindow = window
    ipcMain.on('app:search:open', () => {
      if (!this.isOpen) {
        this.startSearch()
      } else {
        this.stopSearch()
      }
    })

    ipcMain.handle('app:search:start', (_, value) => {
      this.requestId = this.parentWindow.webContents.findInPage(value)
      this.query = value
    })

    ipcMain.handle('app:search:clear', () => {
      this.parentWindow.webContents.stopFindInPage('clearSelection')
    })

    ipcMain.handle('app:search:stop', () => {
      this.parentWindow.webContents.stopFindInPage('clearSelection')
      this.stopSearch()
    })

    ipcMain.handle('app:search:prev', () => {
      if (!this.requestId) {
        return
      }
      this.requestId = this.parentWindow.webContents.findInPage(this.query!, {
        forward: false,
        findNext: true
      })
    })

    ipcMain.handle('app:search:next', () => {
      if (!this.requestId) {
        return
      }
      this.requestId = this.parentWindow.webContents.findInPage(this.query!, {
        forward: true,
        findNext: true
      })
    })

    this.parentWindow.webContents.on('found-in-page', (_, result) => {
      this.searcher?.webContents.send('app:search:found', result)
    })
  }

  public startSearch(): void {
    this.searcher = new BrowserView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    const parentBounds = this.parentWindow.getBounds()
    this.parentWindow.setBrowserView(this.searcher)
    this.searcher.setBounds({ x: parentBounds.width - width - padding, y: padding * 2, width: width, height: height })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.searcher.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/search.html')
    } else {
      this.searcher.webContents.loadFile(join(__dirname, '../renderer/search.html'))
    }
    this.searcher.webContents.addListener('dom-ready', () => {
      this.searcher?.webContents.focus()
    })
    this.isOpen = true
  }

  public stopSearch(): void {
    this.requestId = undefined
    this.searcher?.webContents.close()
    this.isOpen = false
  }
}

export function registerSearchHandlersForWindow(window: BrowserWindow): void {
  new SearchInWindow(window)
}
