import { JSX, useEffect, useState } from 'react'
import { Release } from './Relase'

export interface GithubRelease {
  tag_name: string,
  name: string,
  body: string
}

export const ReleaseNotes = (): JSX.Element => {

  const [releases, setReleases] = useState<GithubRelease[]>([])

  useEffect(() => {
    fetch('https://api.github.com/repos/Delwing/arkadia-config-editor/releases')
      .then((res) => res.json())
      .then(releases => releases as GithubRelease[])
      .then(releases => setReleases(releases))
  }, [])

  return <>
    <h5>Ostatnie zmiany:</h5>
    {releases.slice(0, 3).map(release => <Release key={release.tag_name} release={release} />)}
  </>

}
