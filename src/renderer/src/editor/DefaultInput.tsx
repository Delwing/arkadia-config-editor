import { FormControl } from 'react-bootstrap'
import { ReactElement } from 'react'
import * as React from 'react'

interface DefaultInput {
  name: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function DefaultInput({ name, value, updateCallback }: DefaultInput): ReactElement<HTMLInputElement> {
  return (
    <FormControl
      spellCheck={false}
      name={name}
      type={'text'}
      value={value}
      onChange={(e) => updateCallback(e.currentTarget.value)}
    />
  )
}
