import { FormControl } from 'react-bootstrap'
import { ReactElement } from 'react'
import * as React from 'react'

interface NumberProperties {
  name: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function NumberInput({ name, value, updateCallback }: NumberProperties): ReactElement<HTMLInputElement> {
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
