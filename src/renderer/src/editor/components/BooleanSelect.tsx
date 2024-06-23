import { JSX } from 'react'
import { InputProperties } from '../Components'
import { FormCheck } from 'react-bootstrap'

export function BooleanSelect({ name, value, updateCallback }: InputProperties): JSX.Element {
  return (
    <FormCheck
      name={name}
      type={'switch'}
      checked={value as boolean}
      onChange={(e) => {
        return updateCallback(e.currentTarget.checked)
      }}
    />
  )
}
