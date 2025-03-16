import { Card } from 'react-bootstrap'
import { FiletypeJson } from 'react-bootstrap-icons'

export const DashboardCard = ({ filePath }: { filePath: string }) => {
  return (
    <Card
      style={{ width: '500px' }}
      key={filePath}
      onClick={() => window.api.openConfig(filePath)}
      role={'button'}
      className={'bg-transparent border-secondary-subtle'}
    >
      <Card.Header>
        <FiletypeJson className={'me-1'} />
        {filePath.replace(/^.*[\\/]/, '')}
      </Card.Header>
      <Card.Footer>
        <Card.Text>
          <small>{filePath}</small>
        </Card.Text>
      </Card.Footer>
    </Card>
  )
}
