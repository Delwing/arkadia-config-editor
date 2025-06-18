import { ContentType, FieldDefinition, FieldType, Value } from '../../../shared/Config'
import { JSX } from 'react'
import { BooleanSelect } from './components/BooleanSelect'
import { NumberInput } from './components/NumberInput'
import { ColorSelect } from './components/ColorSelect'
import { FileInput } from './components/FileInput'
import { DefaultInput } from './components/DefaultInput'
import { CheckBoxInput } from './components/CheckBoxInput'
import { TextAreaInput } from './components/TextAreaInput'

import keyModifiers from '../../../shared/mudlet_key_modifiers.json'
import { KeyInput } from './components/KeyInput'
import { PasswordInput } from './components/PasswordInput'
import { VisualListInput } from './components/VisualListInput'
import { Settings } from '../Editor'


export interface InputProperties {
  name: string
  value?: Value
  configPath: string
  updateCallback: (value: Value) => void
  definition?: FieldDefinition
  setValidationErrors?: (error?: string) => void
}

export function controller(fieldType: FieldType, settings: Settings, contentType?: ContentType): (arg: InputProperties) => JSX.Element {
  switch (fieldType) {
    case 'boolean':
      return BooleanSelect
    case 'number':
      return NumberInput
    case 'string':
      switch (contentType) {
        case 'mudlet_color':
          return ColorSelect
        case 'file_path':
          return FileInput
        case 'keybind':
          return KeyInput
        case 'password':
          return PasswordInput
        default:
          return DefaultInput
      }
    case 'list':
      switch (contentType) {
        case 'key_modifiers':
          return CheckBoxInput(keyModifiers)
        default:
          return settings.visualListChange ? VisualListInput : TextAreaInput
      }
    case 'map':
      switch (contentType) {
        case 'key_modifiers':
          return CheckBoxInput(keyModifiers)
        default:
          return TextAreaInput
      }
    default:
      return DefaultInput
  }
}
