import { JSX } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import colors from '../../../../shared/colors.json'
import { InputProperties } from '../Components'
import mudletColors from '../../../../shared/mudlet_colors.json'
import { ColorSamples } from './ColorSamples'
import { FormControl } from 'react-bootstrap'
import { default as convert } from 'color-convert'

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

function findClosestColor(r: number, g: number, b: number): string {
  let distance = 99999999999999
  let currentPick: string = ''
  for (const colorsKey of mudletColors) {
    const rgb = colors[colorsKey]
    if (rgb[3] && rgb[3] < 1) {
      continue
    }
    const compDistance = Math.pow(r - rgb[0], 2) + Math.pow(g - rgb[1], 2) + Math.pow(b - rgb[2], 2)
    if (compDistance < distance) {
      currentPick = colorsKey
      distance = compDistance
    }
  }
  return currentPick
}

export function ColorSelect({ name, value, updateCallback }: InputProperties): JSX.Element {
  const options = mudletColors.map((item: string) => ({ value: item, label: item, color: colors[item] })) as {
    value: string
    label: string
    color: number[]
  }[]
  const defaultValue = options.filter((el) => el.value == value)[0]

  return (
    <>
      <div className={'d-flex w-100 align-content-stretch'}>
        <FormControl
          type={'color'}
          className={'me-2 h-auto'}
          value={'#' + convert.rgb.hex(colors[value as string] ?? 'black')}
          onChange={(e) => updateCallback(findClosestColor(...convert.hex.rgb(e.currentTarget.value)))}
          title={"Wybierz kolor"}
        />
        <Select
          className={'w-100'}
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
      </div>
      <ColorSamples colorName={value as string} />
    </>
  )
}
