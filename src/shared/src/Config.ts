export interface ConfigResponse {
  name: string
  path: string
  fields: Field[]
}

export interface FieldDefinition {
  name: string
  default_value: string | boolean | string[] | number | Map<string, string | number | boolean>
  field_type: 'string' | 'boolean' | 'list' | 'map' | 'number'
  content_type?: 'mudlet_color' | 'key_modifiers' | 'file_path' | 'password'
  implicit?: boolean
}

export interface MudletSchema {
  fields: FieldDefinition[]
}

export interface Field {
  definition: FieldDefinition
  value?: boolean | string | number
  description?: string
}

export interface Config
  extends Map<string, boolean | number | string | Map<string, boolean | string | number>> {}
