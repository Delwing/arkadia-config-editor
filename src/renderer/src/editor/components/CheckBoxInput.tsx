import { Container, FormCheck } from 'react-bootstrap'
import { JSX } from 'react'
import { InputProperties } from '../Components'

export function CheckBoxInput(options: string[]) {
  return function CheckBoxImplementation({ name, value, updateCallback }: InputProperties): JSX.Element {
    const current = value as (number | string)[]

    return (
      <>
        <Container fluid={true} className={'form-control'}>
          {options.map((label: string | number) => (
            <FormCheck
              key={label}
              id={`${name}.${label}`}
              label={label}
              checked={current?.includes(label)}
              value={label}
              onChange={(e) =>
                updateCallback(
                  JSON.stringify(
                    e.currentTarget.checked ? current.concat([label]) : current.filter((current) => current !== label)
                  )
                )
              }
            />
          ))}
        </Container>
      </>
    )
  }
}
