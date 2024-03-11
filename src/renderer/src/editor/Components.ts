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

export interface InputProperties {
  name: string
  value?: Value
  configPath: string
  updateCallback: (value: Value) => void
  definition?: FieldDefinition
}

export function controller(fieldType: FieldType, contentType?: ContentType): (arg: InputProperties) => JSX.Element {
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
        default:
          return DefaultInput
      }
    case 'list':
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
