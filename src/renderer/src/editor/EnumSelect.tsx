import { FormSelect } from 'react-bootstrap'
import { ReactElement } from 'react'
import * as React from 'react'
import Select from 'react-select'

interface EnumProperties {
  name: string
  value: string
  items: string[]
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

const selectForm = true

export function EnumSelect({ name, value, items, updateCallback }: EnumProperties): ReactElement<HTMLInputElement> {
  if (selectForm) {
    const options = items.map((item: string) => ({ value: item, label: item }))
    const defaultValue = options.filter((el) => el.value == value)[0]
    return (
      <>
        <Select
          unstyled={true}
          name={name}
          options={options}
          defaultValue={defaultValue}
          isSearchable={true}
          menuShouldScrollIntoView={false}
          menuPlacement={'auto'}
          classNames={{
            menu: () => 'z-2',
            control: (state) => (state.isFocused ? 'form-control focus' : 'form-control'),
            menuList: () => 'form-control mt-1 p-0 z-2',
            option: (state) => `p-2 pointer ${state.isFocused ? 'bg-primary text-light' : ''}`
          }}
        />
      </>
    )
  }

  return (
    <FormSelect value={value.toString()} onSelect={(e) => updateCallback(e.currentTarget.value)}>
      {items.map((value) => (
        <option key={value}>{value}</option>
      ))}
    </FormSelect>
  )
}
