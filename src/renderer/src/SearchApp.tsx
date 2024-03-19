import './assets/search.scss'

import { createRef, JSX, useCallback, useEffect, useReducer } from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import * as React from 'react'
import { ChevronDown, ChevronUp, XLg } from 'react-bootstrap-icons'

interface Results {
  requestId?: number
  activeMatchOrdinal: number
  matches: number
}

function SearchApp(): JSX.Element {
  const ref: React.RefObject<HTMLInputElement> = createRef()

  function resultReducer(_: Results, newValue: Results): Results {
    return newValue
  }

  const [results, updateResults] = useReducer(resultReducer, { activeMatchOrdinal: 0, matches: 0 })

  useEffect(() => {
    ref.current?.focus()
    return window.api.listenToSearch((result) => {
      updateResults(result)
    })
  }, [])
  const onFormControlKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (event.shiftKey) {
          window.api.searchPrev()
        } else {
          window.api.searchNext()
        }
        break
      case 'Escape':
        window.api.stopSearch()
        break
      default:
        return
    }
  }, [])

  const clearSearch = useCallback(() => {
    window.api.clearSearch()
    updateResults({ activeMatchOrdinal: 0, matches: 0 })
  }, [])

  return (
    <>
      <InputGroup size={'sm'} className={'d-flex position-relative align-items-center'}>
        <FormControl
          spellCheck={false}
          placeholder={'Szukaj...'}
          type={'text'}
          ref={ref}
          onChange={(event) =>
            event.currentTarget.value !== '' ? window.api.search(event.currentTarget.value) : clearSearch()
          }
          onKeyDown={onFormControlKeyDown}
        />
        <small className={'d-inline-flex align-items-center position-absolute gap-2 text-muted'} style={{ right: '5px', zIndex: 999 }}>
          {results.requestId && (
            <>
              {results.activeMatchOrdinal}/{results.matches}
            </>
          )}
          <span className={'d-inline-flex align-items-center border-start ps-2 border-1 gap-2'}>
            <ChevronUp role={'button'} onClick={() => window.api.searchPrev()} />
            <ChevronDown role={'button'} onClick={() => window.api.searchNext()} />
            <XLg role={'button'} onClick={() => window.api.stopSearch()} />
          </span>
        </small>
      </InputGroup>
    </>
  )
}

export default SearchApp
