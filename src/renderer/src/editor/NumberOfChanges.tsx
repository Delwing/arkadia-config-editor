import { createPortal } from 'react-dom'
import { Badge } from 'react-bootstrap'
import { useEffect, useRef, useState } from 'react'
import { FieldChangeEvent, ValueCollector } from '@renderer/Editor'
import { Value } from '../../../shared/Config'

export function NumberOfChanges({ valueCollector }: { valueCollector: ValueCollector }) {
  const [currentNumberOfChanges, setCurrentNumberOfChanges] = useState(0)

  const changedFields = useRef<string[]>([])
  const currentlySaved = useRef<Record<string, Value>>({})

  useEffect(() => {
    const listener = (event: Event) => {
      if (event instanceof FieldChangeEvent) {
        const currentValue = JSON.stringify(valueCollector.config[event.key])
        const savedValue = JSON.stringify(currentlySaved.current[event.key])
        const loadedValue = JSON.stringify(valueCollector.fields.get(event.key)?.value)
        const isChanged =
          currentlySaved.current[event.key] !== undefined ? currentValue !== savedValue : currentValue !== loadedValue
        if (isChanged && changedFields.current.indexOf(event.key) == -1) {
          changedFields.current.push(event.key)
        } else if (!isChanged) {
          changedFields.current.splice(changedFields.current.indexOf(event.key), 1)
        }
        setCurrentNumberOfChanges(changedFields.current.length)
        window.api.notifyAboutChanges(changedFields.current.length > 0)
      }
    }
    valueCollector.addEventListener('fieldChangeEvent', listener)
    return () => {
      valueCollector.removeEventListener('fieldChangeEvent', listener)
    }
  }, [])

  const onSave = () => {
    const saved = Object.fromEntries(changedFields.current.map((key) => [key, valueCollector.config[key]]))
    currentlySaved.current = Object.assign({}, currentlySaved.current, saved)
    changedFields.current = []
    window.api.notifyAboutChanges(false)
    setCurrentNumberOfChanges(0)
  }

  useEffect(() => {
    valueCollector.addEventListener('file-saved', onSave)
    return () => valueCollector.removeEventListener('file-saved', onSave)
  }, [valueCollector])

  return (
    <>
      {createPortal(
        <>
          <Badge bg={'info'} className={'d-flex align-items-center px-3'}>
            Liczba niezapisanych zmian: {currentNumberOfChanges}
          </Badge>
        </>,
        document.body.querySelector('.control-buttons')!
      )}
    </>
  )
}
