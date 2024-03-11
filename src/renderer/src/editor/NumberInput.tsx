import { FormControl } from 'react-bootstrap'
import {JSX} from 'react'
import {InputProperties} from "./Components";

export function NumberInput({ name, value, updateCallback }: InputProperties): JSX.Element {
  return (
    <FormControl
      spellCheck={false}
      name={name}
      type={'number'}
      value={value}
      onChange={(e) => updateCallback(e.currentTarget.value)}
    />
  )
}
