import { Modal, Stack } from 'react-bootstrap'
import { useEffect, useState } from 'react'

export const About = () => {

  const [version, setVersion] = useState('unknown')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    return window.api.onAbout((version) => {
      setVersion(version)
      setOpen(true)
    })
  }, [])

  return <Modal size={'lg'} show={open} onHide={() => setOpen(false)}>
    <Modal.Header>
      Arkadia Config Editor {version}
    </Modal.Header>
    <Modal.Body>
      <Stack gap={2}>
        <strong>Autor: Dargoth</strong>
        <span className={'small'}>
          <em>
            Edytor zbiera proste, anonimowe dane jak fakt zapisania configu (bez danych).
            Pomaga mi to dowiedzieć się jak aplikacja jest wykorzystywana.
          </em>
      </span>
      </Stack>
    </Modal.Body>
  </Modal>

}
