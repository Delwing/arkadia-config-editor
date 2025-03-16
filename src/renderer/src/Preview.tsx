import { Button, Modal } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { Config } from '../../shared/Config'
import { createPortal } from 'react-dom'
import { Code } from 'react-bootstrap-icons'

import { CodePane } from '@renderer/CodePane'

export const Preview = ({ config }: { config: Config }) => {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(JSON.stringify(config, null, 4))
  }, [show])

  return (
    <>
      <Modal size={'xl'} centered show={show} onHide={() => setShow(false)} id={'code-preview'}>
        <Modal.Header closeButton>
          <h3>Podgląd</h3>
        </Modal.Header>
        <Modal.Body>
          <CodePane value={value} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Zamknij</Button>
        </Modal.Footer>
      </Modal>
      {createPortal(
        <>
          <Button className={'shadow'} disabled={!config} onClick={() => setShow(true)}>
            <Code className={'me-1'} />
            Podgląd
          </Button>
        </>,
        document.body.querySelector('.control-buttons')!
      )}
    </>
  )
}
