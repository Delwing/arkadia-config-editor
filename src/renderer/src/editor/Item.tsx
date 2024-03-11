import { createRef, JSX, RefObject, useContext, useEffect, useReducer } from 'react'
import { FieldDefinition, Value } from '../../../shared/Config'
import { Badge, FormGroup, FormLabel, FormText, Row, Stack } from 'react-bootstrap'

import showdown from 'showdown'
import hljs from 'highlight.js'

import { ConfigContext } from '../Editor'
import { controller } from './Components'
import { DefaultValue } from './DefaultValue'

const converter = new showdown.Converter({
  omitExtraWLInCodeBlocks: false
})

interface FieldWithDefinition {
  definition: FieldDefinition
  value?: Value
  description?: string
  collector: (value?: Value) => void
}

export default function Item({ definition, description, value, collector }: FieldWithDefinition): JSX.Element {
  const descriptionRef: RefObject<HTMLDivElement> = createRef()
  const config = useContext(ConfigContext)
  const defaultsValueAsText = JSON.stringify(definition.default_value, null, 4).replace(/^"/, '').replace(/"$/, '')

  useEffect(() => {
    collector(value)
  }, [])

  function updateValueAndCollect(_: Value, newState: Value): Value {
    collector(newState)
    return newState
  }

  const [currentValue, updateValue] = useReducer(updateValueAndCollect, value!)

  useEffect(() => {
    descriptionRef.current?.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el as HTMLElement))
  }, [])

  return (
    <Row>
      <div data-schemapath={definition.name}>
        <FormGroup controlId={definition.name}>
          <FormLabel className={'d-flex mt-4 justify-content-between align-items-center'}>
            <h5 className={'mb-0'}>{definition.name}</h5>
            <small>
              <Stack direction={'horizontal'} className={'me-1'} gap={1}>
                <Badge pill bg={'secondary'}>
                  {definition.field_type}
                </Badge>
                {definition.content_type && <Badge bg={'secondary'}>{definition.content_type}</Badge>}
              </Stack>
            </small>
          </FormLabel>
          {controller(
            definition.field_type,
            definition.content_type
          )({
            name: definition.name,
            value: currentValue,
            configPath: config.directory,
            updateCallback: (value: Value) => updateValue(value),
            definition: definition
          })}
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
              onClick={() => updateValue(definition.default_value)}
              defaultsValueAsText={defaultsValueAsText}
            />
          </FormText>
        </FormGroup>
        <hr />
      </div>
    </Row>
  )
}
