import { JSX, useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { DashboardCard } from './DashboardCard'

export const Recent = (): JSX.Element => {
  const [recent, setRecent] = useState([] as string[])

  useEffect(() => {
    window.api.getRecent().then((recent) => {
      setRecent(recent)
    })
  }, [])

  return (
    <Container fluid className={'p-4'}>
      <h5 className={'mb-3 pb-1 border-bottom'}>Ostatnio otwarte:</h5>
      <div className={'d-flex gap-4 justify-content-start flex-wrap'}>
        {recent.map((recent) => (
          <DashboardCard key={recent} filePath={recent} />
        ))}
      </div>
    </Container>
  )
}
