import { JSX } from 'react'
import { GithubRelease } from './ReleaseNotes'
import { Badge, Card } from 'react-bootstrap'

export const Release = ({ release }: { release: GithubRelease }): JSX.Element => {

  const imageRegex = /!\[image]\((.*)\)/g

  return <Card className="mb-1">
      <Card.Body>
        <h6 className="pb-2">
          <Badge className="me-1">
            {release.tag_name}
          </Badge>
          {release.name}
        </h6>
        <div style={{whiteSpace: "pre"}} dangerouslySetInnerHTML={{ __html: release.body.replace(imageRegex, '').trim() }}></div>
      </Card.Body>
    </Card>

}
