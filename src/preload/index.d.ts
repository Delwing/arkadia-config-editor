import { ElectronAPI } from '@electron-toolkit/preload'
import { ConfigResponse } from '../main/config-loader'
import { CfgApi } from './index'

declare global {

  ConfigResponse

  interface Window {
    electron: ElectronAPI
    api: CfgApi
  }
}
