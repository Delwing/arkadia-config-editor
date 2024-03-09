const fs = require('fs')

const themesDir = 'node_modules/bootswatch/dist'
const themeTemplate = 'src/renderer/src/assets/theme-sandstone.scss'
fs.readdirSync(themesDir).forEach((theme) => {
  const content = fs.readFileSync(themeTemplate, { encoding: 'utf-8' }).replaceAll('sandstone', theme)
  fs.writeFileSync(themeTemplate.replace('sandstone', theme), content)
  console.log(`${theme} created.`)
})
