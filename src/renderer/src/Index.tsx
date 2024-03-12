import { JSX, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { ConfigResponse } from '../../shared/Config'

export default function Index({ config }: { config: ConfigResponse }): JSX.Element {
  const [keys, setKeys] = useState([] as string[])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setKeys(
      Array.from(config.fields.keys())
        .map((field) => field)
        .sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase())
        })
    )
  }, [])

  const onFilterChange = useCallback(
    (event: { currentTarget: { value: SetStateAction<string> } }) => setFilter(event.currentTarget.value),
    []
  )

  if (keys.length === 0) {
    return <></>
  }

  return (
    <>
      <Form.Group className={'mb-2'}>
        <Form.Control type={'text'} placeholder={'Filtruj...'} onInput={onFilterChange} />
      </Form.Group>
      <ul className={'keys-index'}>
        {keys
          .filter((el) => filter === '' || el.toLowerCase().match(filter.toLowerCase()))
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
    </>
  )
}
