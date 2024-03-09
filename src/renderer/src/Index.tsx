import { JSX, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'

export default function Index(): JSX.Element {
  const [keys, setKeys] = useState([] as string[])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    return window.api.onConfig((config) => {
      setKeys(config.fields.map((field) => field.definition.name).sort())
    })
  }, [])

  const onFilterChange = useCallback(
    (event: { currentTarget: { value: SetStateAction<string> } }) => setFilter(event.currentTarget.value),
    []
  )

  if (keys.length === 0) {
    return <></>
  }

  return (
    <div className={'index p-4'}>
      <Form.Group className={'mb-2'}>
        <Form.Control type={'text'} placeholder={'Filtruj...'} onInput={onFilterChange} />
      </Form.Group>
      <ul className={'keys-index'}>
        {keys
          .filter((el) => filter === '' || el.match(filter))
          .map((key) => (
            <li key={key}>
              <a
                className={'text-decoration-none'}
                role={'button'}
                onClick={() => {
                  const element = document.body.querySelector(`[data-schemapath="${key}"]`)
                  element?.scrollIntoView()
                  //@ts-ignore can call focus safely
                  element?.querySelector('input, select')?.focus()
                }}
              >
                {key}
              </a>
            </li>
          ))}
      </ul>
    </div>
  )
}
