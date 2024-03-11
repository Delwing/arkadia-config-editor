import {createRef, RefObject, useCallback, useContext, useEffect, useState, JSX} from 'react'
import {FieldDefinition, Value} from '../../../shared/Config'
import {Badge, FormGroup, FormLabel, FormText, Row, Stack} from 'react-bootstrap'

import {DefaultInput} from './DefaultInput'
import {TextAreaInput} from './TextAreaInput'
import {CheckBoxInput} from './CheckBoxInput'
import {NumberInput} from './NumberInput'
import {FileInput} from './FileInput'
import {ColorSelect} from './ColorSelect'

import keyModifiers from '../../../shared/mudlet_key_modifiers.json'

import showdown from 'showdown'
import Highlight from 'react-highlight'
import hljs from 'highlight.js'


import {ConfigContext} from "../Editor";
import {BooleanSelect} from "./BooleanSelect";
import {InputProperties} from "./Components";

const converter = new showdown.Converter({
  omitExtraWLInCodeBlocks: false
})

interface FieldWithDefinition {
  definition: FieldDefinition
  value?: Value
  description?: string
  collector: (value?: Value) => void
}

export default function Item({definition, description, value, collector}: FieldWithDefinition): JSX.Element {
  const descriptionRef: RefObject<HTMLDivElement> = createRef()

  const config = useContext(ConfigContext)
  const [currentValue, setCurrentValue] = useState(value)

  const defautlValueAsText = JSON.stringify(definition.default_value, null, 4)
    .replace(/^"/, '')
    .replace(/"$/, '')

  function setValue(value: Value): void {
    console.log("COLLECTOR", value)
    collector(value)
    setCurrentValue(value)
  }

  const setDefaultValue = useCallback(() => {
    setValue(definition.default_value);
  }, [definition.default_value])

  useEffect(() => {
    descriptionRef.current?.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el as HTMLElement))
  }, [])

  function controller(): (arg: InputProperties) => JSX.Element {
    switch (definition.field_type) {
      case 'boolean':
        return BooleanSelect
      case 'number':
        return NumberInput
      case 'string':
        switch (definition.content_type) {
          case 'mudlet_color':
            return ColorSelect
          case 'file_path':
            return FileInput
          default:
            return DefaultInput
        }
      case 'list':
      case 'map':
        switch (definition.content_type) {
          case 'key_modifiers':
            return CheckBoxInput(keyModifiers)
          default:
            return TextAreaInput
        }
      default:
        return DefaultInput
    }
  }

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
          {controller()({
            name: definition.name,
            value: currentValue,
            configPath: config.directory,
            updateCallback: (value: Value) => setValue(value),
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
            <div>
              <p className="set-default mt-3 mb-1">Domyślna wartość:</p>
              <div className={'position-relative'}>
                <Badge
                  className="set-default text-light position-absolute end-0 me-2"
                  role={'button'}
                  onClick={setDefaultValue}
                >
                  ustaw
                </Badge>
                <Highlight className={'code json'}>
                  {(defautlValueAsText !== '' ? defautlValueAsText : '​')}
                </Highlight>
              </div>
            </div>
          </FormText>
        </FormGroup>
        <hr/>
      </div>
    </Row>
  )
}
