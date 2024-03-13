import { Alert, Button, Container } from 'react-bootstrap'
import Index from './Index'
import Editor from './Editor'
import { createRef, JSX, RefObject, useEffect, useMemo, useState } from 'react'
import { ConfigResponse } from '../../shared/Config'
import { ChevronDoubleUp, ExclamationCircle } from 'react-bootstrap-icons'

let timeout: string | number | NodeJS.Timeout | undefined

export function ConfigContainer({ loadKey, config }: { loadKey: number; config: ConfigResponse }): JSX.Element {
  const ref: RefObject<HTMLDivElement> = createRef()
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    ref.current?.addEventListener('scroll', () => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
      setShowing(true)
    })
    ref.current?.addEventListener('scrollend', (e) => {
      const scrollTop = (e.currentTarget as HTMLDivElement)?.scrollTop
      timeout = setTimeout(() => setShowing(false), 3000)
      if (scrollTop == 0) {
        clearTimeout(timeout)
        setShowing(false)
      }
    })
  }, [])

  const index = useMemo(() => <Index key={loadKey} config={config} />, [loadKey, config])
  const editor = useMemo(() => <Editor key={loadKey} config={config} />, [loadKey, config])

  const configKeysSize = Array.from(config.fields.values()).filter(
    (field) => field.value !== undefined && field.definition !== undefined
  ).length

  return (
    <Container fluid={true} className={'d-flex config-container g-0 gap-1'}>
      <div className={'index p-4'}>{index}</div>
      <div ref={ref} className={'config p-4 border-start border-secondary-subtle shadow-sm'}>
        {configKeysSize == 0 && (
          <Alert variant={'danger'} className={'d-flex align-items-center'}>
            <ExclamationCircle className={'me-2'} /> Wydaje się, że załadowany plik nie jest plikiem konfiguracjnym.
          </Alert>
        )}
        {editor}
        {showing && (
          <Button
            className={'sticky-bottom float-end'}
            onClick={() => ref.current && ref.current.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ChevronDoubleUp />
          </Button>
        )}
      </div>
    </Container>
  )
}
