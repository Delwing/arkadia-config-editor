import { FormControl } from 'react-bootstrap'
import { JSX } from 'react'
import { InputProperties } from '../Components'

export function HexColorInput({ name, value, updateCallback }: InputProperties): JSX.Element {
  const current = typeof value === 'string' ? (value.startsWith('#') ? value : `#${value}`) : '#000000'
  return (
    <FormControl type={'color'} name={name} value={current} onChange={(e) => updateCallback(e.currentTarget.value)} />
  )
}
