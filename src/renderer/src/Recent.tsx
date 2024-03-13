import { JSX, useEffect, useState } from 'react'
import { Card, Container } from 'react-bootstrap'
import { FiletypeJson } from 'react-bootstrap-icons'

export const Recent = (): JSX.Element => {
  const [recent, setRecent] = useState([] as string[])

  useEffect(() => {
    window.api.getRecent().then((recent) => {
      setRecent(recent)
    })
  }, [])

  return (
    <Container fluid className={'p-4'}>
      <h5>Ostatnio otwarte:</h5>
      <hr />
      <div className={'d-flex ps-4 gap-4 flex-column justify-content-start border-start ms-2'}>
        {recent.map((recent) => (
          <Card
            style={{ width: '500px' }}
            key={recent}
            onClick={() => window.api.openConfig(recent)}
            role={'button'}
            className={'bg-transparent border-secondary-subtle'}
          >
            <Card.Header>
              <FiletypeJson className={'me-1'} />
              {recent.replace(/^.*[\\/]/, '')}
            </Card.Header>
            <Card.Footer>
              <Card.Text>
                <small>{recent}</small>
              </Card.Text>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </Container>
  )
}
