import { JSX } from 'react'
import { Container } from 'react-bootstrap'
import { ReleaseNotes } from './ReleaseNotes'
import { RecentlyOpened } from './RecentlyOpened'

export const Dashboard = (): JSX.Element => {

  return (
    <Container className={'p-4 d-flex gap-4 m-2'}>
      <div>
        <RecentlyOpened />
      </div>
      <div>
        <ReleaseNotes />
      </div>
    </Container>
  )
}
