import { ReactElement } from 'react'
import * as React from 'react'
import { EnumSelect } from './EnumSelect'

interface BooleanProperties {
  name: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function BooleanSelect({ name, value, updateCallback }: BooleanProperties): ReactElement<HTMLInputElement> {
  return <EnumSelect name={name} value={value} items={['true', 'false']} updateCallback={updateCallback} />
}
