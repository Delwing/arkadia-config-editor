import { FormControl, InputGroup } from 'react-bootstrap'
import * as React from 'react'
import { createRef, JSX, RefObject, useEffect, useLayoutEffect, useState } from 'react'
import { InputProperties } from '../Components'

import hljs from 'highlight.js'
import { useHljsStyle } from '../../hooks/useHljsStyle'

function padZero(str: string, len?: number) {
  len = len || 2
  let zeros = new Array(len).join('0')
  return (zeros + str).slice(-len)
}

function invertColor(hex?: string, bw?: boolean) {
  if (!hex) {
    return undefined
  }
  const hexParts = hex.substring(hex.indexOf('(') + 1, hex.indexOf(')')).split(',')
  let r = parseInt(hexParts[0]),
    g = parseInt(hexParts[1]),
    b = parseInt(hexParts[2])
  if (bw) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF'
  }
  let R = (255 - r).toString(16)
  let G = (255 - g).toString(16)
  let B = (255 - b).toString(16)
  return '#' + padZero(R) + padZero(G) + padZero(B)
}

function getLineNumberAndColumnIndex(textarea: HTMLTextAreaElement) {
  let textLines = textarea.value.substring(0, textarea.selectionStart).split('\n')
  let currentLineNumber = textLines.length
  let currentColumnIndex = textLines[textLines.length - 1].length
  return [currentLineNumber, currentColumnIndex]
}

export function TextAreaInput({ name, value, updateCallback, definition, setValidationErrors = () => {} }: InputProperties): JSX.Element {
  const emptyValue = definition?.field_type === 'list' ? [] : {}
  let formattedValue = JSON.stringify(value ?? emptyValue, null, 4)
  const [textValue, setTextValue] = useState(formattedValue)
  const codeRef: RefObject<HTMLDivElement> = createRef()
  const textAreaRef: RefObject<HTMLTextAreaElement> = createRef()
  const [lineNumber, setLineNumber] = useState(0)
  const [focus, setFocus] = useState(false)
  const [withLines, setWithLines] = useState(false)

  const theme = useHljsStyle()

  useEffect(() => {
   if (JSON.stringify(value ?? emptyValue).trim() !== textValue.replaceAll(/\s/g, '').trim()) {
      setTextValue(JSON.stringify(value ?? emptyValue, null, 4))
    }
  }, [value])

  useEffect(() => {
    try {
      const parsed = JSON.parse(textValue)
      updateCallback(parsed)
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        setValidationErrors(e.message)
      }
    }
    updateHighlight()
  }, [textValue])

  function updateHighlight() {
    hljs.highlightElement(codeRef.current as HTMLElement)
  }

  useEffect(() => {
    if (textAreaRef.current && codeRef.current) {
      const bg = codeRef.current.computedStyleMap()?.get('background')?.toString()
      if (bg) {
        const color = invertColor(bg)
        if (color) {
          textAreaRef.current.style.caretColor = color
        }
      }
    }
  }, [theme])

  useLayoutEffect(() => {
    window.api.getWithLines().then((value) => {
      setWithLines(value)
    })
    return window.api.onWithLinesChange((value) => setWithLines(value))
  }, [])

  const onChange = (value: string): void => {
    setTextValue(value)
  }

  const setPositionOfHelperLine = () => {
    if (!textAreaRef.current) {
      return
    }
    const [line] = getLineNumberAndColumnIndex(textAreaRef.current)
    setLineNumber(line)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.code === 'Tab') {
      const tab = '    '
      const startPos = e.currentTarget.selectionStart
      const endPos = e.currentTarget.selectionEnd
      e.currentTarget.value =
        e.currentTarget.value.substring(0, startPos) +
        tab +
        e.currentTarget.value.substring(endPos, e.currentTarget.value.length)
      e.currentTarget.selectionStart = startPos + tab.length
      e.currentTarget.selectionEnd = startPos + tab.length
      e.preventDefault()
      onChange(e.currentTarget.value)
    }
  }

  const numberOfLines = textValue.split('\n').length

  return (
    <div className={'mb-3'}>
      <div className={'position-relative code-editor' + (withLines ? ' with-lines' : '')} data-hljs-theme={theme}>
        <pre className={'position-absolute code-pane'}>
          <code className={'line-numbers hljs'}>
            {Array.from({ length: numberOfLines }, (_, i) => (
              <div key={i} className={'d-flex align-items-center' + ((i + 1 == lineNumber && focus) ? ' selected-line' : '')}>
                {i + 1}
              </div>
            ))}
            <span className={'line-numbers-divider'} />
          </code>
          <code ref={codeRef} className={'language-json form-control'}>
            {textValue}
          </code>
        </pre>
        <InputGroup>
          <FormControl
            ref={textAreaRef}
            name={name}
            as={'textarea'}
            rows={numberOfLines}
            value={textValue}
            spellCheck={false}
            onKeyDown={onKeyDown}
            onSelect={setPositionOfHelperLine}
            onBlur={() => setFocus(false)}
            onFocus={() => setFocus(true)}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
        </InputGroup>
      </div>
    </div>
  )
}
