import { ElectronAPI } from '@electron-toolkit/preload'
import { ConfigResponse } from '../main/config-loader'
import { CfgApi } from './index'
import { SearchApi } from './search-preload'

declare global {
  ConfigResponse

  interface Window {
    electron: ElectronAPI
    api: CfgApi
    searchApi: SearchApi
  }
}
