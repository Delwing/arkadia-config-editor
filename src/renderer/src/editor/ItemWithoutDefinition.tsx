import {JSX, useState} from 'react'
import {Badge, FormGroup, FormLabel, Row, Stack} from 'react-bootstrap'

import {DefaultInput} from './DefaultInput'
import {Value} from "../../../shared/Config";
import {TextAreaInput} from "./TextAreaInput";


export default function ItemWithoutDefinition({name, value, configPath}: { name: string, value: Value, configPath: string }): JSX.Element {
  const [currentValue, setCurrentValue] = useState(value)

  function controller(): JSX.Element {
    const valueType = typeof value
    switch (valueType) {
      case 'object':
        return <TextAreaInput name={name} value={currentValue} configPath={configPath} updateCallback={setCurrentValue} />
      default:
        return <DefaultInput name={name} value={currentValue} configPath={configPath} updateCallback={setCurrentValue}/>
    }
  }
  controller()
  return (
    <Row>
      <div data-schemapath={name}>
        <FormGroup controlId={name}>
          <FormLabel className={'d-flex mt-4 justify-content-between align-items-center'}>
            <h5 className={'mb-0'}>{name}</h5>
            <small>
              <Stack direction={'horizontal'} className={'me-1'} gap={1}>
                <Badge pill bg={'secondary'}>
                  unknown
                </Badge>
              </Stack>
            </small>
          </FormLabel>
          {controller()}
        </FormGroup>
        <hr/>
      </div>
    </Row>
  )
}
