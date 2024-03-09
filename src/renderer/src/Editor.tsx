import { FormEvent, JSX, RefObject, useEffect, useState } from 'react'
import { ConfigResponse } from '../../shared/src/Config'
import Item from './editor/Item'
import { Form } from 'react-bootstrap'

interface EditorProps {
  formRef: RefObject<HTMLFormElement>
}

function Editor({ formRef }: EditorProps): JSX.Element {
  const [config, setConfig] = useState<ConfigResponse>()
  const [key, setKey] = useState(new Date().getTime())

  useEffect(() => {
    return window.api.onConfig((config): void => {
      setKey(new Date().getTime())
      setConfig(config)
    })
  }, [])

  if (!config) {
    return <></>
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    const formData = new FormData(event.currentTarget)
    for (const [key, value] of formData.entries()) {
      console.log(key, typeof value, value)
    }
    event.preventDefault()
  }

  return (
    <Form key={key} ref={formRef} onSubmit={(event) => onSubmit(event)}>
      <div className={'d-flex gap-2 align-items-center'}>
        <div>
          <p className={'h3 m-0'}>{config.name}</p>
          <p className={'m-0 small font-monospace text-muted'}>
            <em>{config.path}</em>
          </p>
        </div>
      </div>

      <hr className={'mt-1 mb-4'} />
      {config.fields.map((field) => (
        <Item
          key={field.definition.name}
          definition={field.definition}
          description={field.description}
          value={field.value}
        />
      ))}
    </Form>
  )
}

export default Editor
