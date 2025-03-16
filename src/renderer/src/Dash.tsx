import { Recent } from '@renderer/Recent'
import { Profiles } from '@renderer/Profiles'
import { ReleaseNotes } from '@renderer/ReleaseNotes'

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
