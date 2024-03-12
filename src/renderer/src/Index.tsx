import { JSX, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { ConfigResponse } from '../../shared/Config'
import * as React from 'react'
import { XLg } from 'react-bootstrap-icons'

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

  const onFormControlKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.code) {
      case 'Escape':
        setFilter('')
        break
      default:
        return
    }
  }, [])

  if (keys.length === 0) {
    return <></>
  }

  return (
    <>
      <Form.Group className={'mb-2 d-flex align-items-center position-relative'}>
        <Form.Control
          type={'text'}
          placeholder={'Filtruj...'}
          value={filter}
          onInput={onFilterChange}
          onKeyDown={onFormControlKeyDown}
          spellCheck={false}
        />
        {filter && (
          <span className={'d-inline-flex align-items-center position-absolute'} style={{ right: '10px' }}>
            <XLg role={'button'} onClick={() => setFilter('')} />
          </span>
        )}
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
                {filter == ''
                  ? key
                  : key.split(new RegExp(`(${filter})`, 'g')).map((part, index) => (
                      <span key={index} className={part === filter ? 'text-body-emphasis' : ''}>
                        {part}
                      </span>
                    ))}
              </a>
            </li>
          ))}
      </ul>
    </>
  )
}
