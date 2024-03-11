import {FormControl} from 'react-bootstrap'
import {JSX} from 'react'
import {InputProperties} from "./Components";

export function DefaultInput({ name, value, updateCallback }: InputProperties): JSX.Element {
  return (
    <FormControl
      spellCheck={false}
      name={name}
      type={'text'}
      value={value as string}
      onChange={(e) => updateCallback(e.currentTarget.value)}
    />
  )
}
