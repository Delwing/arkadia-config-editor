import { useEffect, useState } from 'react'

export function useHljsStyle() {

  const [theme, setTheme] = useState<string>()

  useEffect(() => {
    window.api.getHljsTheme().then(result => setTheme(result.theme))
    return window.api.onHljsThemeChange(theme => setTheme(theme))
  }, [])

  return theme

}
