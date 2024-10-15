import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { JSX } from 'react'
import { InputProperties } from '../Components'

export function FileInput({ name, configPath, value, updateCallback }: InputProperties): JSX.Element {
  return (
    <InputGroup>
      <FormControl
        spellCheck={false}
        name={name}
        type={'text'}
        value={value as string}
        onChange={(e) => updateCallback(e.currentTarget.value)}
      />
      <Button
        variant={'primary'}
        onClick={() => window.api.getFilePath(configPath, ['wav', 'mp3']).then(newValue => newValue ?? value).then(updateCallback)}
      >
        Wybierz plik
      </Button>
    </InputGroup>
  )
}
