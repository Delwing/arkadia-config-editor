import React, { createRef, JSX, RefObject, useContext, useEffect, useReducer, useState } from 'react'
import { FieldDefinition, Value } from '../../../shared/Config'
import { Badge, FormGroup, FormLabel, FormText, Row, Stack } from 'react-bootstrap'

import showdown from 'showdown'
import hljs from 'highlight.js'

import { ConfigContext, FieldChangeEvent, Settings } from '../Editor'
import { controller } from './Components'
import { DefaultValue } from './DefaultValue'
import { ArrowCounterclockwise } from 'react-bootstrap-icons'
import { useHljsStyle } from '../hooks/useHljsStyle'
import { validator } from '../editor/Validators'

const converter = new showdown.Converter({
  omitExtraWLInCodeBlocks: false
})

interface FieldWithDefinition {
  definition: FieldDefinition
  value?: Value
  description?: string
  collector: (value?: Value) => void
  settings: Settings
  eventTarget: EventTarget
}

export default function Item({
  definition,
  description,
  value,
  collector,
  settings,
  eventTarget
}: FieldWithDefinition): JSX.Element {
  const descriptionRef: RefObject<HTMLDivElement> = createRef()
  const config = useContext(ConfigContext)
  const defaultsValueAsText = JSON.stringify(definition.default_value, null, 4).replace(/^"/, '').replace(/"$/, '')
  const [validationErrors, setValidationErrors] = useState<string>()
  const theme = useHljsStyle()

  if (definition.field_type == 'map' && JSON.stringify(value) === "[]") {
    value = new Map();
  }

  if (definition.field_type == 'list' && JSON.stringify(value) === "{}") {
    value = [];
  }

  useEffect(() => {
    collector(value)
  }, [])

  useEffect(() => {
    descriptionRef.current?.querySelectorAll('pre').forEach((el) => {
      if (el instanceof HTMLElement) {
        el.setAttribute('data-hljs-theme', theme ?? '')
        el.querySelectorAll('code').forEach(code => hljs.highlightElement(code))
      }
    })
  }, [theme])

  function updateValueAndCollect(_: Value, newState: Value): Value {
    collector(newState)
    return newState
  }

  const [currentValue, updateValue] = useReducer(updateValueAndCollect, value!)

  useEffect(() => {
    setValidationErrors(undefined)
    if (isValid(currentValue, definition.content_type) && isValid(currentValue, definition.field_type)) {
      eventTarget.dispatchEvent(
        new FieldChangeEvent(definition.name, JSON.stringify(value) !== JSON.stringify(currentValue))
      )
    }
  }, [currentValue])

  useEffect(() => {
    descriptionRef?.current?.querySelectorAll('ul code').forEach((el) => {
      if (
        el.innerHTML == currentValue?.toString() ||
        (Array.isArray(currentValue) && (currentValue as string[]).indexOf(el.innerHTML) > -1)
      ) {
        el.classList.add('text-decoration-dotted')
      } else {
        el.classList.remove('text-decoration-dotted')
      }
    })
  }, [currentValue])

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

  return (
    <Row>
      <div data-schemapath={definition.name} className={'' + (validationErrors ? 'invalid-value' : '')}>
        <FormGroup controlId={definition.name}>
          <FormLabel className={'d-flex mt-4 justify-content-between align-items-center'}>
            <h5 className={'mb-0 d-inline-flex justify-content-center align-items-center'}>
              {definition.name}{' '}
              {JSON.stringify(value) !== JSON.stringify(currentValue) && (
                <ArrowCounterclockwise
                  onClick={(e) => {
                    e.preventDefault()
                    updateValue(value!)
                  }}
                  role={'button'}
                  className={'ms-3 mt-1 text-muted'}
                  size={15}
                  title={'Cofnij'}
                />
              )}
            </h5>
            <small>
              <Stack direction={'horizontal'} className={'me-1'} gap={1}>
                <Badge pill bg={'secondary'}>
                  {definition.field_type}
                </Badge>
                {definition.content_type && (
                  <Badge pill bg={'secondary'}>
                    {definition.content_type}
                  </Badge>
                )}
                {definition.implicit && (
                  <Badge pill bg={'secondary'}>
                    implicit
                  </Badge>
                )}
              </Stack>
            </small>
          </FormLabel>
          <div className={'position-relative'}>
            {React.createElement(controller(definition.field_type, settings, definition.content_type), {
              key: definition.name,
              name: definition.name,
              value: currentValue ?? '',
              configPath: config.directory,
              updateCallback: (value: Value) => updateValue(value),
              definition: definition,
              setValidationErrors: setValidationErrors
            })}
            {validationErrors && (validationErrors?.indexOf('<code>') ? (
              <div className={'invalid-feedback d-block ms-1'}
                dangerouslySetInnerHTML={{__html: validationErrors}}>
              </div>
            ) : (
              <div className={'invalid-feedback d-block ms-1'}>{validationErrors}</div>
            ))}
          </div>
          <FormText className={'d-block description'}>
            {description && (
              <div
                ref={descriptionRef}
                dangerouslySetInnerHTML={{
                  __html: converter.makeHtml(description)
                }}
              ></div>
            )}
            <DefaultValue
              onClick={() => updateValue(JSON.parse(JSON.stringify(definition.default_value)))}
              defaultsValueAsText={defaultsValueAsText}
            />
          </FormText>
        </FormGroup>
        <hr />
      </div>
    </Row>
  )
}
