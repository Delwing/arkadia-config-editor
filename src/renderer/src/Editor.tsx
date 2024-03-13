import { createContext, createRef, FormEvent, JSX, RefObject, useContext, useEffect } from 'react'
import { Config, ConfigResponse, Value } from '../../shared/Config'
import Item from './editor/Item'
import { Button, Form } from 'react-bootstrap'
import * as React from 'react'
import ItemWithoutDefinition from './editor/ItemWithoutDefinition'
import { NotificationContext } from './NotificationCenter'
import { Floppy } from 'react-bootstrap-icons'
import { createPortal } from 'react-dom'

class ValueCollector {
  config: Config = {}

  set(key: string, value: Value): void {
    this.config[key] = value
  }
}

export const ConfigContext: React.Context<{ directory: string }> = createContext({ directory: '' })

interface EditorProps {
  config: ConfigResponse
}

function Editor({ config }: EditorProps): JSX.Element {
  const formRef: RefObject<HTMLFormElement> = createRef()
  const valueCollector = new ValueCollector()

  const ref: RefObject<HTMLDivElement> = createRef()
  const notificationService = useContext(NotificationContext)

  useEffect(() => {
    return window.api.onRequestSave(() => formRef.current?.requestSubmit())
  }, [])

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const invalid = event.currentTarget.querySelector('.form-control.is-invalid')
    if (invalid) {
      invalid.parentElement?.parentElement?.scrollIntoView()
      return
    }

    window.api.saveConfig(config.path, valueCollector.config).then(() => {
      notificationService?.current?.addNotification({
        header: 'Zapisano konfiguracje',
        message: `Zapisano ${Object.keys(valueCollector.config).length} kluczy\n${config.path}`
      })
    })
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
        {createPortal(
          <Button className={'shadow'} disabled={!config} onClick={() => formRef.current?.requestSubmit()}>
            <Floppy className={'me-1'} /> Zapisz
          </Button>,
          document.body.querySelector('.control-buttons')!
        )}
      </Form>
    </ConfigContext.Provider>
  )
}

export default Editor
