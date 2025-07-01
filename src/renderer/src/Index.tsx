import { JSX, SetStateAction, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { ConfigResponse } from '../../shared/Config'
import * as React from 'react'
import { XLg } from 'react-bootstrap-icons'

export default function Index({ config }: { config: ConfigResponse }): JSX.Element {
  const [keys, setKeys] = useState([] as string[])
  const [filter, setFilter] = useState('')
  const [groupKeys, setGroupKeys] = useState(false)

  useEffect(() => {
    setKeys(
      Array.from(config.fields.keys())
        .map((field) => field)
        .sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase())
        })
    )
  }, [])

  useLayoutEffect(() => {
    window.api.getGroupKeys().then((value) => setGroupKeys(value))
    return window.api.onGroupKeysChange((value) => setGroupKeys(value))
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

  interface Node {
    name: string
    path: string
    key?: string
    children: Map<string, Node>
  }

  function buildTree(list: string[]): Node[] {
    const root = new Map<string, Node>()
    list.forEach((key) => {
      const parts = key.split('.')
      let current = root
      let path = ''
      let node: Node
      parts.forEach((part, index) => {
        path = path ? `${path}.${part}` : part
        if (!current.has(part)) {
          current.set(part, { name: part, path, children: new Map() })
        }
        node = current.get(part)!
        if (index === parts.length - 1) {
          node.key = key
        }
        current = node.children
      })
    })
    return Array.from(root.values())
  }

  const highlight = (value: string): JSX.Element[] | string =>
    filter == ''
      ? value
      : value.split(new RegExp(`(${filter})`, 'gi')).map((part, index) => (
          <span key={index} className={part.toLowerCase() === filter.toLowerCase() ? 'text-body-emphasis' : ''}>
            {part}
          </span>
        ))

  const renderNodes = (nodes: Node[]): JSX.Element[] => {
    return nodes.map((node) => (
      <li key={node.path}>
        {node.key ? (
          <a
            className={'text-decoration-none'}
            role={'button'}
            onClick={() => {
              const element = document.body.querySelector(`[data-schemapath="${node.key}"]`)
              element?.scrollIntoView()
              //@ts-ignore can call focus safely
              element?.querySelector('input, select')?.focus()
            }}
          >
            {highlight(node.name)}
          </a>
        ) : (
          <span>{highlight(node.name)}</span>
        )}
        {node.children.size > 0 && <ul>{renderNodes(Array.from(node.children.values()))}</ul>}
      </li>
    ))
  }

  const filteredKeys = keys.filter((el) => filter === '' || el.toLowerCase().includes(filter.toLowerCase()))

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
      {groupKeys ? (
        <ul className={'keys-index'}>{renderNodes(buildTree(filteredKeys))}</ul>
      ) : (
        <ul className={'keys-index'}>
          {filteredKeys.map((key) => (
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
                {highlight(key)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
