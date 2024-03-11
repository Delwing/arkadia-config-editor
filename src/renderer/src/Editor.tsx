import { createContext, createRef, FormEvent, JSX, RefObject, useEffect, useState } from 'react'
import { Config, ConfigResponse, Value } from '../../shared/Config'
import Item from './editor/Item'
import { Form } from 'react-bootstrap'
import * as React from 'react'
import ItemWithoutDefinition from './editor/ItemWithoutDefinition'

class ValueCollector {
  config: Config = {}

  set(key: string, value: Value): void {
    this.config[key] = value
  }
}

export const ConfigContext: React.Context<{ directory: string }> = createContext({ directory: '' })

interface EditorProps {
  formRef: RefObject<HTMLFormElement>
}

function Editor({ formRef }: EditorProps): JSX.Element {
  const valueCollector = new ValueCollector()
  const ref: RefObject<HTMLDivElement> = createRef()
  const [recent, setRecent] = useState([] as string[])
  const [config, setConfig] = useState<ConfigResponse>()
  const [key, setKey] = useState(new Date().getTime())

  useEffect(() => {
    return window.api.onConfig((config): void => {
      setKey(new Date().getTime())
      setConfig(config)
    })
  }, [])

  useEffect(() => {
    window.api.getRecent().then((recent) => {
      setRecent(recent)
    })
  }, [])

  if (!config) {
    return (
      <>
        <h5>Ostatnio otwarte:</h5>
        <ul style={{ listStyleType: 'none' }}>
          {recent.map((recent) => (
            <li key={recent}>
              <a
                className={'text-decoration-none'}
                onClick={() => window.api.openConfig(recent)}
                role={'button'}
                title={recent}
              >
                {recent.replace(/^.*[\\/]/, '')}
              </a>
            </li>
          ))}
        </ul>
      </>
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const invalid = event.currentTarget.querySelector('.form-control.is-invalid')
    if (invalid) {
      invalid.parentElement?.parentElement?.scrollIntoView()
      return
    }

    for (const configKey in valueCollector.config) {
      console.log(configKey, valueCollector.config[configKey])
    }
  }

  const items: JSX.Element[] = Array.from(config.fields.entries()).map(([key, field]) =>
    field.definition ? (
      <Item
        key={key}
        definition={field.definition!}
        description={field.description}
        value={field.value}
        collector={(value?: Value) => valueCollector.set(key, value ?? '')}
      />
    ) : (
      <ItemWithoutDefinition
        key={key}
        name={key}
        configPath={config.path}
        value={field.value!}
        collector={(value?: Value) => valueCollector.set(key, value ?? '')}
      />
    )
  )

  return (
    <ConfigContext.Provider value={config}>
      <Form key={key} ref={formRef} onSubmit={(event) => onSubmit(event)}>
        <div ref={ref} className={'d-flex gap-2 align-items-center'}>
          <div>
            <p className={'h3 m-0'}>{config.name}</p>
            <p className={'m-0 small font-monospace text-muted'}>
              <em>{config.path}</em>
            </p>
          </div>
        </div>
        <hr className={'mt-1 mb-4'} />
        {items}
      </Form>
    </ConfigContext.Provider>
  )
}

export default Editor
