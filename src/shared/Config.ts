export interface ConfigResponse {
  name: string
  directory: string
  path: string
  fields: Map<string, Field>
}

export interface FieldDefinition {
  name: string
  default_value: Value
  field_type: 'string' | 'boolean' | 'list' | 'map' | 'number'
  content_type?: 'mudlet_color' | 'key_modifiers' | 'file_path' | 'password'
  implicit?: boolean
}

export interface MudletSchema {
  fields: FieldDefinition[]
}

export interface Field {
  definition?: FieldDefinition
  value?: boolean | number | string | Map<string, boolean | string | number>
  description?: string
}

export type Value =  boolean | number | string | string[] | number[] | Map<string, boolean | string | number>

export interface Config
  extends Record<string, Value> {}
