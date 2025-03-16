const fs = require('fs')

const themesDir = 'node_modules/bootswatch/dist'
const themeTemplate = 'src/renderer/src/assets/theme-sandstone.scss'
fs.readdirSync(themesDir).forEach((theme) => {
  const content = fs.readFileSync(themeTemplate, { encoding: 'utf-8' }).replaceAll('sandstone', theme)
  fs.writeFileSync(themeTemplate.replace('sandstone', theme), content)
  console.log(`${theme} created.`)
})

const hljsThemeDir = 'node_modules/highlight.js/scss/'
const themesFile = 'src/renderer/src/assets/hljs.scss'

fs.writeFileSync(themesFile, "")
fs.readdirSync(hljsThemeDir).filter(file => file.endsWith(".scss")).forEach((theme) => {
  const themeName = theme.substring(0, theme.lastIndexOf("."))
  fs.appendFileSync(themesFile, `[data-hljs-theme="${themeName}"] { @import "highlight.js/scss/${themeName}"; }\n`)
  console.log(`hljs ${themeName} added.`)
})
