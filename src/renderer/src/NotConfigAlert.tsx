import { ExclamationCircle, Pin } from 'react-bootstrap-icons'
import { Alert } from 'react-bootstrap'
import { useState } from 'react'

export function NotConfigAlert() {
  const [isSticky, setIsSticky] = useState(true)
  const [onMouseOver, setOnMouseOver] = useState(false)

  return (
    <Alert variant={'danger'} className={`d-flex align-items-center justify-content-between${isSticky ? ' sticky-top' : ''}`}>
      <div>
        <ExclamationCircle className={'me-2'} /> Wydaje się, że załadowany plik nie jest plikiem konfiguracjnym.
      </div>
      {isSticky && (<div>
        <Pin role={'button'} className={'float-end'} style={{scale: onMouseOver ? '1.1' : '1'}} onMouseOut={() => setOnMouseOver(false)} onMouseOver={() => setOnMouseOver(true)} onClick={() => setIsSticky(false)} />
      </div>)}
    </Alert>
  )
}
