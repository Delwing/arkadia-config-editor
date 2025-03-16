import settings from 'electron-settings'

export const SETTINGS = {
  VISUAL_EDITOR: { key: 'settings:visual-list-editor', label: 'Wizualny edytor list', settingType: Boolean },
  LINE_NUMBERS: { key: 'settings:with-line-numbers', label: 'Numery linii w edytorze kodu', settingType: Boolean }
}

export default class SettingsService {

  public getSetting(key: string) {
    return settings.getSync(key)?.valueOf()
  }

  public setSetting(key: string, value: any) {
    return settings.setSync(key, value)
  }
}
