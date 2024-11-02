import * as React from 'react'
import {
  createContext,
  createRef,
  FormEvent,
  JSX,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { Config, ConfigResponse, Field, Value } from '../../shared/Config'
import Item from './editor/Item'
import { Button, Form, Modal } from 'react-bootstrap'
import ItemWithoutDefinition from './editor/ItemWithoutDefinition'
import { NotificationContext } from './NotificationCenter'
import { Floppy, Search } from 'react-bootstrap-icons'
import { createPortal } from 'react-dom'
import { Preview } from './Preview'

export class ValueCollector {
  readonly fields: Map<string, Field>
  config: Config = {}

  constructor(fields: Map<string, Field>) {
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

  get(key: string) {
    return this.config[key]
  }
}

export const ConfigContext: React.Context<{ directory: string }> = createContext({ directory: '' })

interface EditorProps {
  config: ConfigResponse
}

function Editor({ config }: EditorProps): JSX.Element {
  const formRef: RefObject<HTMLFormElement> = createRef()
  const valueCollector = useRef(new ValueCollector(config.fields))

  const notificationService = useContext(NotificationContext)

  const [preview, setPreview] = useState(false)
  const [previewJson, setPreviewJson] = useState('')

  useEffect(() => {
    formRef.current?.parentElement?.scrollIntoView()
    return window.api.onRequestSave(() => formRef.current?.requestSubmit())
  }, [])

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const invalid = event.currentTarget.querySelector('.form-control.is-invalid')
    if (invalid) {
      invalid.closest('.item')?.scrollIntoView()
      return
    }

    window.api.saveConfig(config.path, valueCollector.current.config).then(() => {
      notificationService?.current?.addNotification({
        header: 'Zapisano konfiguracje',
        message: `Zapisano ${Object.keys(valueCollector.current.config).length} kluczy\n${config.path}`
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
        newValue={valueCollector.current.get(key) ?? field.value}
        collector={(value?: Value) => valueCollector.current.set(key, value)}
      />
    ) : (
      <ItemWithoutDefinition
        key={key}
        name={key}
        configPath={config.path}
        value={field.value!}
        newValue={valueCollector.current.get(key) ?? field.value}
        collector={(value?: Value) => valueCollector.current.set(key, value)}
      />
    )
  )

  return (
    <ConfigContext.Provider value={config}>
      <Form ref={formRef} onSubmit={(event) => onSubmit(event)}>
        <div className={'d-flex gap-2 align-items-center'}>
          <div>
            <h3 className={'m-0'}>{config.name}</h3>
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
        {createPortal(
          <Button className={'shadow'} disabled={!config} onClick={() => {
            setPreviewJson(JSON.stringify(valueCollector.current.config, null, 4))
            setPreview(!preview)
          }
          }>
            <Search className={'me-1'} /> Podgląd
          </Button>,
          document.body.querySelector('.control-buttons')!
        )}
      </Form>
      <Modal size={"xl"} scrollable show={preview} onHide={() => setPreview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Podgląd</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Preview value={previewJson} />
        </Modal.Body>
        <Modal.Footer>
          <Button className={'shadow'} onClick={() => setPreview(false)}>Zamknij</Button>
        </Modal.Footer>
      </Modal>
    </ConfigContext.Provider>
  )
}

export default Editor
