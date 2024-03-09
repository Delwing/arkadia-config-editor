import { ReactElement } from 'react'
import * as React from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import colors from '../../../shared/colors.json'

interface ColorSelectProperties {
  name: string
  value: string
  items: string[]
  updateCallback: React.Dispatch<React.SetStateAction<string>>
}

const dot = (color: number[]): CSSObjectWithLabel => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 20,
    width: 40,
    border: '2px solid var(--bs-primary-border-subtle)'
  }
})

export function ColorSelect({
  name,
  value,
  items,
  updateCallback
}: ColorSelectProperties): ReactElement<HTMLInputElement> {
  const options = items.map((item: string) => ({ value: item, label: item, color: colors[item] })) as {
    value: string
    label: string
    color: number[]
  }[]
  const defaultValue = options.filter((el) => el.value == value)[0]
  return (
    <>
      <Select
        unstyled={true}
        name={name}
        options={options}
        value={defaultValue}
        isSearchable={true}
        menuShouldScrollIntoView={false}
        menuPlacement={'auto'}
        onChange={(val) => updateCallback(val!.value)}
        classNames={{
          menu: () => 'z-2',
          control: (state) => (state.isFocused ? 'form-control focus' : 'form-control'),
          menuList: () => 'form-control mt-1 p-0 z-2',
          option: (state) => `p-2 pointer ${state.isFocused ? 'bg-primary text-light' : ''}`
        }}
        styles={{
          singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
          option: (styles, { data }) => ({ ...styles, ...dot(data.color) })
        }}
      />
      <code>
      </code>
    </>
  )
}
