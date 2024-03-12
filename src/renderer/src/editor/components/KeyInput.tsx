import {
  Button,
  FormControl,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from 'react-bootstrap'
import { createRef, JSX, RefObject, useEffect, useState } from 'react'
import { InputProperties } from '../Components'

import keys from '../../../../shared/mudlet_keys.json'
import Feedback from 'react-bootstrap/Feedback'

const keyTable = Object.keys(keys)

export function KeyInput({ name, value, updateCallback }: InputProperties): JSX.Element {
  const ref: RefObject<HTMLInputElement> = createRef()
  const [keyGrab, setKeyGrab] = useState(false)
  const [keyGrabbed, setKeyGrabbed] = useState<string | undefined>(undefined)
  const [validKey, setValidKey] = useState(true)

  const keyGrabListener = (e): void => {
    const code = e.code.replace(/^(Key|Digit)/, '')
    if (keyTable.includes(code)) {
      setValidKey(true)
      setKeyGrabbed(code)
    } else {
      setValidKey(false)
      setKeyGrabbed('')
    }
    e.preventDefault()
  }

  useEffect(() => {
    if (keyGrab) {
      ref.current?.focus()
      window.addEventListener('keydown', keyGrabListener)
    } else {
      window.removeEventListener('keydown', keyGrabListener)
    }
  }, [keyGrab])

  return (
    <InputGroup hasValidation>
      <FormControl
        isInvalid={!keyTable.includes(value as string)}
        spellCheck={false}
        name={name}
        type={'text'}
        value={value as string}
        onChange={(e) => updateCallback(e.currentTarget.value)}
      />
      <Feedback type={'invalid'}>
        Klawisz jest nieprawidłowy, lista klawiszy:&nbsp;
        <code>{keyTable.join(', ')}</code>
      </Feedback>
      <Modal show={keyGrab}>
        <ModalHeader>
          <ModalTitle>Pobierz klawisz</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>
            Spróbujemy dopasować klawisz, jak się nie uda, zawsze możesz wpisać jego wartość, po zamknięciu tego okna.
          </div>
          <InputGroup className={'my-3'} hasValidation>
            <InputGroup.Text>Klawisz</InputGroup.Text>
            <FormControl
              ref={ref}
              type={'text'}
              readOnly
              placeholder={'Naciśnij wybrany klawisz...'}
              value={keyGrabbed}
              onChange={() => {}}
              isInvalid={!validKey}
            />
            <Feedback type={'invalid'}>Nie udało się dopasować klawisza</Feedback>
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            variant={'secondary'}
            type={'reset'}
            onClick={() => {
              setKeyGrab(false)
              setKeyGrabbed(undefined)
            }}
          >
            Anuluj
          </Button>
          <Button
            variant={'primary'}
            type={'submit'}
            onClick={() => {
              setKeyGrab(false)
              setKeyGrabbed(undefined)
              updateCallback(keyGrabbed ?? '')
            }}
          >
            Użyj
          </Button>
        </ModalFooter>
      </Modal>
      <Button onClick={() => setKeyGrab(true)}>Pobierz klawisz</Button>
    </InputGroup>
  )
}
