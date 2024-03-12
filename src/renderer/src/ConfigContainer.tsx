import { Container } from 'react-bootstrap'
import Index from './Index'
import Editor from './Editor'
import { JSX, RefObject } from 'react'
import { ConfigResponse } from '../../shared/Config'

export function ConfigContainer({
  config,
  formRef
}: {
  config: ConfigResponse
  formRef: RefObject<HTMLFormElement>
}): JSX.Element {
  return (
    <Container fluid={true} className={'d-flex config-container g-0 gap-1'}>
      <div className={'index p-4'}>
        <Index config={config} />
      </div>
      <div className={'config p-4 border-start border-secondary-subtle shadow-sm'}>
        <Editor config={config} formRef={formRef} />
      </div>
    </Container>
  )
}
