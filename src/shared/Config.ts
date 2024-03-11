export interface ConfigResponse {
  name: string
  directory: string
  path: string
  fields: Map<string, Field>
}

export type FieldType = 'string' | 'boolean' | 'list' | 'map' | 'number'
export type ContentType = 'mudlet_color' | 'key_modifiers' | 'file_path' | 'password'

export interface FieldDefinition {
  name: string
  default_value: Value
  field_type: FieldType
  content_type?: ContentType
  implicit?: boolean
}

export interface MudletSchema {
  fields: FieldDefinition[]
}

export interface Field {
  definition?: FieldDefinition
  value?: Value
  description?: string
}

export type Value = boolean | number | string | string[] | number[] | Map<string, boolean | string | number>

export interface Config extends Record<string, Value> {}
