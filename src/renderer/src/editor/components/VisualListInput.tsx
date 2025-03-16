import { JSX, useEffect, useState } from 'react'
import { InputProperties } from '../Components'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { Value } from '../../../../shared/Config'
import { DashCircleFill, GripVertical, PlusCircleFill } from 'react-bootstrap-icons'
import { DndContext, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove, rectSwappingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

interface Sortable {
  id: UniqueIdentifier
  value: string | number
}

export function VisualListInput({ value, updateCallback, definition }: InputProperties): JSX.Element {
  const [sortables, setSortables] = useState<Sortable[]>([])

  const type = isNaN(definition?.default_value[0]) ? 'string' : 'number'

  const createSortables = (): Sortable[] => {
    return (value as string[]).map((value) => {
      return { id: crypto.randomUUID(), value: value }
    })
  }

  const invokeUpdateCallback = (newValue: Sortable[]) => {
    updateCallback(newValue.map((sortable) => sortable.value) as Value)
  }

  const updateValue = (index: UniqueIdentifier, newValue: string) => {
    const newSortables = sortables.map((item) => {
      if (item.id == index) {
        item.value = type === 'number' ? (isNaN(parseInt(newValue)) ? newValue : parseInt(newValue)) : newValue
      }
      return item
    })
    invokeUpdateCallback(newSortables)
  }

  useEffect(() => {
    const newSortables = createSortables()
    if (JSON.stringify(newSortables.map((item) => item.value)) == JSON.stringify(sortables.map((item) => item.value))) {
      return
    }
    setSortables(newSortables)
  }, [value])

  const addValue = () => {
    sortables.push({ id: crypto.randomUUID(), value: '' })
    invokeUpdateCallback(sortables)
  }
  const removeValue = (index: UniqueIdentifier) => {
    const indexToRemove = sortables.map((item) => item.id).indexOf(index)
    const newSortables = sortables.toSpliced(indexToRemove, 1)
    invokeUpdateCallback([...newSortables])
  }

  const handleDragEvent = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const newItems = arrayMove(
      sortables,
      sortables.map((item) => item.id).indexOf(active.id),
      sortables.map((item) => item.id).indexOf(over.id)
    )

    setSortables(newItems)
    invokeUpdateCallback(newItems)
  }

  return (
    <div className={'d-flex flex-column gap-1'}>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEvent}>
        <SortableContext items={sortables} strategy={rectSwappingStrategy}>
          {sortables.map((item, index) => (
            <InputEntry
              key={item.id}
              id={item}
              index={index}
              value={item.value}
              updateValue={(value) => updateValue(item.id, value)}
              removeValue={() => removeValue(item.id)}
            />
          ))}
        </SortableContext>
        <Button className={'text-center w-100'} variant={'outline-secondary'} onClick={() => addValue()}>
          <PlusCircleFill />
        </Button>
      </DndContext>
    </div>
  )
}

function InputEntry({
  id,
  value,
  updateValue,
  removeValue
}: {
  id: any
  index: number
  value: string | number
  updateValue: (value: string) => void
  removeValue: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable(id)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <InputGroup>
        <Button variant={'secondary'} {...listeners}>
          <GripVertical />
        </Button>
        <FormControl
          spellCheck={false}
          name={id.id}
          type={'text'}
          value={value}
          onChange={(e) => updateValue(e.currentTarget.value)}
        />
        <Button onClick={() => removeValue()}>
          <DashCircleFill />
        </Button>
      </InputGroup>
    </div>
  )
}
