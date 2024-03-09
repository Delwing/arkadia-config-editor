import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { ReactElement } from 'react'
import * as React from 'react'

interface FileProperties {
  name: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function FileInput({ name, value, updateCallback }: FileProperties): ReactElement<HTMLInputElement> {
  return (
    <InputGroup>
      <FormControl
        spellCheck={false}
        name={name}
        type={'text'}
        value={value}
        onChange={(e) => updateCallback(e.currentTarget.value)}
      />
      <Button variant={'primary'}>Wybierz plik</Button>
    </InputGroup>
  )
}
