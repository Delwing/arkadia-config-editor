import {FieldDefinition, Value} from "../../../shared/Config";

export interface InputProperties {
  name: string
  value?: Value
  configPath: string
  updateCallback: (value: Value) => void
  definition?: FieldDefinition
}
