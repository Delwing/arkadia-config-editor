import { Alert, Button, Container } from 'react-bootstrap'
import Index from './Index'
import Editor from './Editor'
import { createRef, JSX, RefObject, useEffect, useMemo, useState } from 'react'
import { ConfigResponse } from '../../shared/Config'
import { ChevronDoubleUp, Copy, ExclamationCircle } from 'react-bootstrap-icons'
import { NotConfigAlert } from './NotConfigAlert'

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
      const target = (e.currentTarget as HTMLDivElement)
      const scrollTop = target?.scrollTop
      timeout = setTimeout(() => setShowing(false), 3000)
      if (scrollTop == 0) {
        clearTimeout(timeout)
        setShowing(false)
      }
      if (scrollTop === (target.scrollHeight - target.clientHeight)) {
        clearTimeout(timeout)
        setShowing(true)
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
      <div ref={ref} className={'config p-4 border-start border-secondary-subtle shadow-sm position-relative'}>
        {configKeysSize == 0 && <NotConfigAlert />}
        {configKeysSize > 0 && !config.hasLoadingTrigger && (
          <Alert variant={'warning'}>
            <div  className={'d-flex align-items-center'}>
            <ExclamationCircle className={'me-2'} />
            Plik nie jest ładowany automatycznie.
            </div>
            <div className={'mt-1'}>
            Możesz utworzyć trigger ładujący wpisując w Mudlecie
                <code className={'border border-warning rounded px-1 mx-2 text-light bg-dark'}>/cinit imie imie_wolacz</code>
                {(config.fields.get('amap.locating.name')?.value !== undefined && config.fields.get('amap.locating.name')!.value!.toString().length > 0) && <Copy role={'button'} onClick={() => navigator.clipboard.writeText(`/cinit ${config.name} ${config.fields.get('amap.locating.name')?.value}`)} />}
            </div>
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
