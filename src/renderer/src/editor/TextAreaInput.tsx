import { FormControl } from 'react-bootstrap'
import { JSX } from 'react'
import * as React from 'react'

interface TextAreaInput {
  name: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function TextAreaInput({ name, value, updateCallback }: TextAreaInput): JSX.Element {
  const lines = value?.split('\n').length ?? 1
  return (
    <FormControl
      name={name}
      as={'textarea'}
      rows={lines}
      value={value}
      onChange={(e) => updateCallback(e.currentTarget.value)}
    />
  )
}
