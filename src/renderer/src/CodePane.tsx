import { useHljsStyle } from './hooks/useHljsStyle'
import { createRef, RefObject, useEffect } from 'react'

import hljs from 'highlight.js'

export const CodePane = ({ value }: { value: string }) => {
  const theme = useHljsStyle()
  const codeRef: RefObject<HTMLPreElement> = createRef()

  function highlightCode() {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)
    }
  }

  useEffect(() => {
    highlightCode()
  }, [])

  useEffect(() => {
    highlightCode()
  }, [value])

  return (
    <pre data-hljs-theme={theme}>
      <code ref={codeRef}>{value}</code>
    </pre>
  )
}
