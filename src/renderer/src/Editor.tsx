import * as React from 'react'
import {
  createContext,
  createRef,
  FormEvent,
  JSX,
  RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { Config, ConfigResponse, Field, Value } from '../../shared/Config'
import Item from './editor/Item'
import { Button, Form } from 'react-bootstrap'
import ItemWithoutDefinition from './editor/ItemWithoutDefinition'
import { NotificationContext } from './NotificationCenter'
import { Floppy } from 'react-bootstrap-icons'
import { createPortal } from 'react-dom'
import { Preview } from '@renderer/Preview'
import { NumberOfChanges } from '@renderer/editor/NumberOfChanges'

export class FieldChangeEvent extends Event {
  public key: string
  public isChanged: boolean

  constructor(key: string, isChanged: boolean) {
    super('fieldChangeEvent')
    this.key = key
    this.isChanged = isChanged
  }
}

export interface Settings {
  visualListChange: boolean
}

export class ValueCollector extends EventTarget {
  readonly fields: Map<string, Field>
  config: Config = {}

  constructor(fields: Map<string, Field>) {
    super()
    this.fields = fields
  }

  set(key: string, value?: Value): void {
    this.config[key] = value ?? ''
    if (
      (this.fields.get(key)?.definition?.implicit &&
        (value === this.fields.get(key)?.definition?.default_value || value == undefined)) ||
      (!this.fields.get(key)?.definition && value === undefined)
    ) {
      delete this.config[key]
    }
  }
}

export const ConfigContext: React.Context<{ directory: string }> = createContext({ directory: '' })

interface EditorProps {
  config: ConfigResponse
}

function Editor({ config }: EditorProps): JSX.Element {
  const formRef: RefObject<HTMLFormElement> = createRef()
  const valueCollector = useRef(new ValueCollector(config.fields))

  const ref: RefObject<HTMLDivElement> = createRef()
  const notificationService = useContext(NotificationContext)

  const [settings, setSettings] = useState<Settings>({
    visualListChange: false
  })

  useEffect(() => {
    return window.api.onRequestSave(() => {
      formRef.current?.requestSubmit()
    })
  }, [formRef])

  useLayoutEffect(() => {
    window.api.getVisualListEdit().then((value) => {
      setSettings(
        Object.assign({}, settings, {
          visualListChange: value
        })
      )
    })
    return window.api.onVisualListChange((value) => {
      setSettings(
        Object.assign({}, settings, {
          visualListChange: value
        })
      )
    })
  }, [])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = event.currentTarget.querySelector('.form-control.is-invalid')
    if (invalid) {
      invalid.closest('[data-schemapath]')?.scrollIntoView()
      return
    }

    window.api.saveConfig(config.path, valueCollector.current.config).then(() => {
      notificationService?.current?.addNotification({
        header: 'Zapisano konfiguracje',
        icon: Floppy,
        message: `Zapisano ${Object.keys(valueCollector.current.config).length} kluczy\n${config.path}`
      })
      valueCollector.current.dispatchEvent(new Event('file-saved'))
    })
  }

  function openInExplorer() {
    window.api.openInExplorer(config.path)
  }

  const items: JSX.Element[] = Array.from(config.fields.entries()).map(([key, field]) =>
    field.definition ? (
      <Item
        key={key}
        definition={field.definition!}
        description={field.description}
        value={field.value}
        collector={(value?: Value) => valueCollector.current.set(key, value)}
        settings={settings}
        eventTarget={valueCollector.current}
      />
    ) : (
      <ItemWithoutDefinition
        key={key}
        name={key}
        configPath={config.path}
        value={field.value!}
        collector={(value?: Value) => valueCollector.current.set(key, value)}
        settings={settings}
        eventTarget={valueCollector.current}
      />
    )
  )

  return (
    <ConfigContext.Provider value={config}>
      <Form ref={formRef} onSubmit={(event) => onSubmit(event)}>
        <div ref={ref}>
          <div>
            <h3 className={'m-0 mb-1'}>{config.name}</h3>
            <p className={'m-0 small font-monospace text-muted d-flex justify-content-between'}>
              <em>{config.path}</em>
              <Button onClick={() => openInExplorer()} className={'p-0 px-2 font-light'} color={'secondary'}>
                Otwórz lokalizację
              </Button>
            </p>
          </div>
        </div>
        <hr className={'mt-1 mb-4'} />
        {items}
        {createPortal(
          <>
            <Button className={'shadow'} disabled={!config} onClick={() => formRef.current?.requestSubmit()}>
              <Floppy className={'me-1'} />
                Zapisz
            </Button>
          </>,
          document.body.querySelector('.control-buttons')!
        )}
        <NumberOfChanges valueCollector={valueCollector.current} />
      </Form>
      <Preview config={valueCollector.current.config} />
    </ConfigContext.Provider>
  )
}

export default Editor
