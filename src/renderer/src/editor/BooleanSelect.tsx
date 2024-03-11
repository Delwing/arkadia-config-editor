import { JSX } from 'react'
import { EnumSelect } from './EnumSelect'
import {InputProperties} from "./Components";

export function BooleanSelect(props: InputProperties): JSX.Element {
  return EnumSelect([true, false])(props)
}
