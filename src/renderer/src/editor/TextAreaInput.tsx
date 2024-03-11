import {FormControl, InputGroup} from 'react-bootstrap'
import * as React from 'react'
import {JSX, useState} from 'react'
import {validator} from "./Validators"
import {InputProperties} from "./Components";

export function TextAreaInput({name, value, updateCallback, definition}: InputProperties): JSX.Element {
  const [textValue, setTextValue] = useState(JSON.stringify(value, null, 4))
  const lines = textValue?.split('\n').length ?? 1
  const [validationErrors, setValidationErrors] = useState()

  function isValid(value: any, type: string | undefined) {
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
    setValidationErrors(undefined)
    try {
      const parsed = JSON.parse(value)
      if (definition && (!isValid(parsed, definition.field_type) || !isValid(parsed, definition.content_type))) {
        return
      }
      updateCallback(value)
    } catch (e: any) {
      setValidationErrors(e.message)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === "Tab") {
      let tab = "    "
      let startPos = e.currentTarget.selectionStart;
      let endPos = e.currentTarget.selectionEnd;
      e.currentTarget.value = e.currentTarget.value.substring(0, startPos) + tab + e.currentTarget.value.substring(endPos, e.currentTarget.value.length);
      e.currentTarget.selectionStart = startPos + tab.length;
      e.currentTarget.selectionEnd = startPos + tab.length;
      e.preventDefault()
    }
  }

  return (
    <InputGroup>
      <FormControl
        isInvalid={validationErrors}
        name={name}
        as={'textarea'}
        rows={lines}
        value={textValue}
        spellCheck={false}
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      <FormControl.Feedback type="invalid">
        {validationErrors}
      </FormControl.Feedback>
    </InputGroup>
  )
}
