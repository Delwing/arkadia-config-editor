import { JSX, useEffect, useReducer, useState } from 'react'
import { Badge, FormGroup, FormLabel, Row, Stack } from 'react-bootstrap'

import { FieldType, Value } from '../../../shared/Config'
import { controller } from './Components'
import { Trash } from 'react-bootstrap-icons'

function mapTypes(value: Value): FieldType {
  switch (typeof value) {
    case 'object':
      return 'map'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'string':
      return 'string'
    default:
      return 'string'
  }
}

function mapPossibleTypes(value: Value): FieldType[] {
  if (typeof value === 'object') {
    return ['map', 'list']
  } else {
    return ['string', 'number', 'boolean']
  }
}

export default function ItemWithoutDefinition({
  name,
  value,
  configPath,
  collector
}: {
  name: string
  value: Value
  configPath: string
  collector: (value?: Value) => void
}): JSX.Element {
  useEffect(() => {
    collector(value)
  }, [])

  function updateValueAndCollect(_: Value, newState: Value): Value {
    collector(newState)
    return newState
  }

  const [currentValue, updateValue] = useReducer(updateValueAndCollect, value!)
  const [type, setType] = useState(mapTypes(value))
  const [markedForDeletion, setMarkForDeletion] = useState(false)

  function markForDeletion(): void {
    setMarkForDeletion(!markedForDeletion)
    if (!markedForDeletion) {
      collector(undefined)
    } else {
      collector(currentValue)
    }
  }

  return (
    <Row className={markedForDeletion ? 'opacity-25' : ''}>
      <div data-schemapath={name}>
        <FormGroup controlId={name}>
          <FormLabel className={'d-flex mt-4 justify-content-between align-items-center'}>
            <h5 className={'mb-0'}>{name}</h5>
            <small>
              <Stack direction={'horizontal'} className={'me-1'} gap={1}>
                {mapPossibleTypes(value).map((possibleType) => (
                  <Badge
                    key={possibleType}
                    bg={'secondary'}
                    role={'button'}
                    onClick={() => setType(possibleType)}
                    className={possibleType === type ? 'border border-primary text-decoration-underline' : ''}
                  >
                    {possibleType}
                  </Badge>
                ))}
                <Trash role={'button'} className={'ms-2'} onClick={() => markForDeletion()} />
              </Stack>
            </small>
          </FormLabel>
          {controller(type)({
            name: name,
            value: currentValue,
            configPath: configPath,
            updateCallback: (value) => updateValue(value)
          })}
        </FormGroup>
        <hr />
      </div>
    </Row>
  )
}
