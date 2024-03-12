import { FormControl } from 'react-bootstrap'
import { JSX, useState } from 'react'
import { InputProperties } from '../Components'
import { Eye, EyeSlash } from 'react-bootstrap-icons'

export function PasswordInput({ name, value, updateCallback }: InputProperties): JSX.Element {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={'position-relative'}>
      <FormControl
        spellCheck={false}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value as string}
        onChange={(e) => updateCallback(e.currentTarget.value)}
      />
      <div
        className={'d-flex justify-content-center align-items-center position-absolute top-0 h-100'}
        style={{ right: '15px' }}
      >
        {!showPassword ? (
          <Eye size={20} role={'button'} onClick={() => setShowPassword(!showPassword)} />
        ) : (
          <EyeSlash size={20} role={'button'} onClick={() => setShowPassword(!showPassword)} />
        )}
      </div>
    </div>
  )
}
