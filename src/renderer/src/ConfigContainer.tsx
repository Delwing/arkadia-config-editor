import { Button, Container } from 'react-bootstrap'
import Index from './Index'
import Editor from './Editor'
import { createRef, JSX, RefObject, useEffect, useMemo, useState } from 'react'
import { ConfigResponse } from '../../shared/Config'
import { ChevronDoubleUp } from 'react-bootstrap-icons'

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
    ref.current?.addEventListener('scrollend', () => {
      timeout = setTimeout(() => setShowing(false), 3000)
    })
  }, [])

  const index = useMemo(() => <Index key={loadKey} config={config} />, [loadKey, config])
  const editor = useMemo(() => <Editor key={loadKey} config={config} />, [loadKey, config])

  return (
    <Container fluid={true} className={'d-flex config-container g-0 gap-1'}>
      <div className={'index p-4'}>{index}</div>
      <div ref={ref} className={'config p-4 border-start border-secondary-subtle shadow-sm'}>
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
