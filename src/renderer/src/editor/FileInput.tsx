import {Button, FormControl, InputGroup} from 'react-bootstrap'
import {JSX, ReactElement} from 'react'
import * as React from 'react'
import {InputProperties} from "./Components";

interface FileProperties {
  name: string
  configPath: string
  value: string
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function FileInput({name, configPath, value, updateCallback}: InputProperties): JSX.Element {
  return (
    <InputGroup>
      <FormControl
        spellCheck={false}
        name={name}
        type={'text'}
        value={value}
        onChange={(e) => updateCallback(e.currentTarget.value)}
      />
      <Button variant={'primary'} onClick={() => window.api.getFilePath(configPath, ['wav', 'mp3']).then(updateCallback)}>Wybierz
        plik</Button>
    </InputGroup>
  )
}
