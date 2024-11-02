import {initialize} from '@aptabase/electron/main'
import { is } from '@electron-toolkit/utils'

if (!is.dev) {
  initialize("A-EU-6979711383")
}
