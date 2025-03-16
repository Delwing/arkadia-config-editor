import { Container, Spinner } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { DashboardCard } from '@renderer/DashboardCard'
import { JSX } from 'react/jsx-runtime'

export const Profiles = () => {
  const [profiles, setProfiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getConfigs().then((profiles) => {
      setProfiles(profiles)
      setLoading(false)
    })
  }, [])

  let content: JSX.Element | JSX.Element[]
  if (loading) {
    content = <Spinner />
  } else {
    content = profiles.map((recent) => <DashboardCard key={recent} filePath={recent} />)
  }

  return (
    <Container fluid className={'p-4'}>
      <h5 className={'mb-3 pb-1 border-bottom'}>Profile Mudleta:</h5>
      <div className={'d-flex ps-0 gap-4 justify-content-start ms-0 flex-wrap'}>{content}</div>
    </Container>
  )
}
