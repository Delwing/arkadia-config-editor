import { createRef, JSX, ReactElement, RefObject, useCallback, useEffect, useState } from 'react'
import { Field } from '../../../shared/Config'
import { Badge, FormGroup, FormLabel, FormText, Row, Stack } from 'react-bootstrap'

import { BooleanSelect } from './BooleanSelect'
import { DefaultInput } from './DefaultInput'
import { TextAreaInput } from './TextAreaInput'
import { CheckBoxInput } from './CheckBoxInput'
import { NumberInput } from './NumberInput'
import { FileInput } from './FileInput'
import { ColorSelect } from './ColorSelect'

import showdown from 'showdown'
import Highlight from 'react-highlight'
import hljs from 'highlight.js'

import mudletColors from '../../../shared/mudlet_colors.json'
import mudletKeys from '../../../shared/mudlet_key_modifiers.json'

const converter = new showdown.Converter({
  omitExtraWLInCodeBlocks: false
})

export default function Item({ definition, description, value }: Field): JSX.Element {
  const descriptionRef: RefObject<HTMLDivElement> = createRef()

  let transformedValue = definition.default_value
  if (definition.field_type === 'list' || definition.field_type === 'map') {
    transformedValue = JSON.stringify(definition.default_value, null, 4).replace(/^"(.*)"$/, '$1')
    value = JSON.stringify(definition.default_value, null, 4).replace(/^"(.*)"$/, '$1')
  }
  const [currentValue, setCurrentValue] = useState(String(value ?? ''))

  const setDefaultValue = useCallback(() => setCurrentValue(String(transformedValue).trim()), [transformedValue])

  useEffect(() => {
    descriptionRef.current?.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el as HTMLElement))
  }, [])

  const controller = (): ReactElement<HTMLInputElement> => {
    switch (definition.field_type) {
      case 'boolean':
        return <BooleanSelect name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
      case 'number':
        return <NumberInput name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
      case 'string':
        switch (definition.content_type) {
          case 'mudlet_color':
            return (
              <ColorSelect
                name={definition.name}
                value={currentValue}
                items={mudletColors}
                updateCallback={setCurrentValue}
              />
            )
          case 'file_path':
            return <FileInput name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
          default:
            return <DefaultInput name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
        }
      case 'list':
      case 'map':
        switch (definition.content_type) {
          case 'key_modifiers':
            return (
              <CheckBoxInput
                name={definition.name}
                values={currentValue}
                options={mudletKeys}
                updateCallback={setCurrentValue}
              />
            )
          default:
            return <TextAreaInput name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
        }
      default:
        return <DefaultInput name={definition.name} value={currentValue} updateCallback={setCurrentValue} />
    }
  }

  return (
    <Row>
      <div data-schemapath={definition.name}>
        <FormGroup controlId={definition.name}>
          <FormLabel className={'d-flex mt-4 justify-content-between align-items-center'}>
            <h5 className={'mb-0'}>{definition.name}</h5>
            <small>
              <Stack direction={'horizontal'} gap={1}>
                <Badge pill bg={'secondary'}>
                  {definition.field_type}
                </Badge>
                {definition.content_type && <Badge bg={'secondary'}>{definition.content_type}</Badge>}
              </Stack>
            </small>
          </FormLabel>
          {controller()}
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
                  {String(transformedValue !== '' ? transformedValue : '​')}
                </Highlight>
              </div>
            </div>
          </FormText>
        </FormGroup>
        <hr />
      </div>
    </Row>
  )
}
