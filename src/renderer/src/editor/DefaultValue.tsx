import { JSX } from 'react'
import { Badge } from 'react-bootstrap'

import { CodePane } from '@renderer/CodePane'

export function DefaultValue(props: { onClick: () => void; defaultsValueAsText: string }): JSX.Element {
  return (
    <div>
      <p className="set-default mt-3 mb-1">Domyślna wartość:</p>
      <div className={'position-relative'}>
        <Badge className="set-default text-light position-absolute end-0 me-2" role={'button'} onClick={props.onClick}>
          ustaw
        </Badge>
        <CodePane value={props.defaultsValueAsText !== '' ? props.defaultsValueAsText : '​'} />
      </div>
    </div>
  )
}
