import colors from '../../../../shared/colors.json'
import { JSX } from 'react'

export function ColorSamples({ colorName }: { colorName: string }): JSX.Element {
  const color = colors[colorName]
  if (!color) {
    return <></>
  }
  const lightness = color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722
  const demoColor = lightness > 130 ? 'black' : 'white'
  const currentColorRgb: number[] = colors[colorName]
  return (
    <div className={'d-flex gap-3 my-3 align-items-stretch'} style={{ width: '300px' }}>
      <div
        className={'p-1 flex-grow-1 text-center d-inline-flex justify-content-center'}
        style={{
          color: demoColor,
          border: '1px solid',
          backgroundColor: `rgba(${currentColorRgb[0]}, ${currentColorRgb[1]}, ${currentColorRgb[2]}, ${currentColorRgb[3] ?? 1})`,
          fontSize: '10px'
        }}
      >
        <small>{colorName}</small>
      </div>
      <div
        className={'p-1 flex-grow-1 text-center d-inline-flex justify-content-center'}
        style={{
          backgroundColor: 'white',
          border: '1px solid',
          color: `rgba(${currentColorRgb[0]}, ${currentColorRgb[1]}, ${currentColorRgb[2]}, ${currentColorRgb[3] ?? 1})`,
          fontSize: '10px'
        }}
      >
        <small>{colorName}</small>
      </div>
      <div
        className={'p-1 flex-grow-1 text-center d-inline-flex justify-content-center'}
        style={{
          backgroundColor: 'black',
          border: '1px solid',
          color: `rgba(${currentColorRgb[0]}, ${currentColorRgb[1]}, ${currentColorRgb[2]}, ${currentColorRgb[3] ?? 1})`,
          fontSize: '10px'
        }}
      >
        <small>{colorName}</small>
      </div>
    </div>
  )
}
