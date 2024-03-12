import { FormControl, InputGroup } from 'react-bootstrap'
import * as React from 'react'
import { JSX, useEffect, useState } from 'react'
import { validator } from '../Validators'
import { InputProperties } from '../Components'
import { Value } from '../../../../shared/Config'

export function TextAreaInput({ name, value, updateCallback, definition }: InputProperties): JSX.Element {
  let formattedValue = JSON.stringify(value ?? {}, null, 4)
  if (formattedValue === '[]' && definition?.field_type === 'map') {
    formattedValue = '{}'
  }
  if (formattedValue === '{}' && definition?.field_type === 'list') {
    formattedValue = '[]'
  }
  const [textValue, setTextValue] = useState(formattedValue)
  const [validationErrors, setValidationErrors] = useState<string>()

  useEffect(() => {
    if (JSON.stringify(value ?? {}).trim() !== textValue.replaceAll(/\s/g, '').trim()) {
      setTextValue(JSON.stringify(value ?? {}, null, 4))
    }
  }, [value])

  useEffect(() => {
    setValidationErrors(undefined)
    try {
      const parsed = JSON.parse(textValue)
      if (definition && (!isValid(parsed, definition.field_type) || !isValid(parsed, definition.content_type))) {
        return
      }
      updateCallback(parsed)
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        setValidationErrors(e.message)
      }
    }
  }, [textValue])

  function isValid(value: Value, type: string | undefined): boolean {
    if (type && validator[type]) {
      const errors = validator[type](value)
      if (errors) {
        setValidationErrors(errors)
        return false
      }
    }
    return true
  }

  const onChange = (value: string): void => {
    setTextValue(value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.code === 'Tab') {
      const tab = '    '
      const startPos = e.currentTarget.selectionStart
      const endPos = e.currentTarget.selectionEnd
      e.currentTarget.value =
        e.currentTarget.value.substring(0, startPos) +
        tab +
        e.currentTarget.value.substring(endPos, e.currentTarget.value.length)
      e.currentTarget.selectionStart = startPos + tab.length
      e.currentTarget.selectionEnd = startPos + tab.length
      e.preventDefault()
    }
  }

  return (
    <InputGroup>
      <FormControl
        isInvalid={validationErrors !== undefined}
        name={name}
        as={'textarea'}
        rows={textValue.split('\n').length}
        value={textValue}
        spellCheck={false}
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      <FormControl.Feedback type="invalid">{validationErrors}</FormControl.Feedback>
    </InputGroup>
  )
}
