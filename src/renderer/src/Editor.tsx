import { createContext, createRef, FormEvent, JSX, RefObject } from 'react'
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
  config: ConfigResponse
}

function Editor({ formRef, config }: EditorProps): JSX.Element {
  const valueCollector = new ValueCollector()
  const ref: RefObject<HTMLDivElement> = createRef()

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
      <Form ref={formRef} onSubmit={(event) => onSubmit(event)}>
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
