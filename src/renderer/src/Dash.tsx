import { Recent } from './Recent'
import { Profiles } from './Profiles'
import { ReleaseNotes } from './ReleaseNotes'

export const Dash = () => {
  return (
    <>
      <div className={'d-flex'}>
        <div className={'flex-grow-1'}>
          <Recent />
          <Profiles />
        </div>
        <div className={'flex-grow-1'}>
          <ReleaseNotes />
        </div>
      </div>
    </>
  )
}
