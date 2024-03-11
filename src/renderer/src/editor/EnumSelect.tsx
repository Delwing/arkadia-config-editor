import {JSX} from 'react'
import Select from 'react-select'
import {InputProperties} from "./Components";
import {Value} from "../../../shared/Config";

export function EnumSelect(items: Value[]) {
  return ({name, value, updateCallback}: InputProperties): JSX.Element => {
    const options = items.map(value => ({value: value}))
    const selected = value ?? options[0].value
    return (
      <>
        <Select
          unstyled={true}
          name={name}
          options={options}
          value={{value: selected}}
          getOptionLabel={(value) => value.value?.toString() ?? ''}
          getOptionValue={(value => value.value?.toString())}
          isSearchable={true}
          menuShouldScrollIntoView={false}
          menuPlacement={'auto'}
          onChange={value => updateCallback(value!.value)}
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
}

