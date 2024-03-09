import { Container, FormCheck, FormControl } from 'react-bootstrap'
import { ReactElement } from 'react'
import * as React from 'react'

interface CheckBoxInput {
  name: string
  values: string
  options: string[]
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

export function CheckBoxInput({
  name,
  values,
  options,
  updateCallback
}: CheckBoxInput): ReactElement<HTMLInputElement> {
  let current: string[] = []
  try {
    current = JSON.parse(values)
  } catch (e) {
    console.log(values, e)
  }

  return (
    <>
      <FormControl hidden={true} type={'text'} name={name} value={JSON.stringify(current)} readOnly={true} />
      <Container fluid={true} className={'form-control'}>
        {options.map((label) => (
          <FormCheck
            key={label}
            id={`${name}.${label}`}
            label={label}
            checked={values.indexOf(label) > -1}
            onChange={(e) =>
              updateCallback(
                JSON.stringify(
                  e.currentTarget.checked
                    ? current.concat([label])
                    : current.filter((current: string) => current !== label)
                )
              )
            }
          />
        ))}
      </Container>
    </>
  )
}
