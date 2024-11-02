import { createRef, RefObject, useEffect } from 'react'

import hljs from 'highlight.js'

interface PreviewProps {
  value?: string,
}

export const Preview = ({ value }: PreviewProps) => {

  const ref: RefObject<HTMLDivElement> = createRef()

  useEffect(() => {
    ref.current?.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el as HTMLElement))
  }, [])

  return <div ref={ref}>
    <pre>
    <code className="json language-json hljs">
    {value}
  </code>
  </pre>
  </div>
}
