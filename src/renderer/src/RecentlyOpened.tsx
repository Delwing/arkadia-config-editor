import { JSX, useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { FiletypeJson } from 'react-bootstrap-icons'

export const RecentlyOpened = (): JSX.Element => {

  const [recent, setRecent] = useState([] as string[])

  useEffect(() => {
    window.api.getRecent().then((recent) => {
      setRecent(recent)
    })
  }, [])

  return <>
    <h5>Ostatnio otwarte:</h5>
    <hr />
    <div className={'d-flex ps-0 gap-4 flex-column justify-content-start ms-2'}>
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
  </>
}
