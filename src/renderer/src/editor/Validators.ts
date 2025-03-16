const validGuilds = [
  "KM", "OS", "SGW", "GL", "KG", "CKN", "OHM", "MC", "WKS", "RA", "SC", "ZT", "PE", "KGKS", "ES", "GP", "ZH", "ZS", "NPC", "OK", "KS", "LE"
]

import keys from '../../../shared/mudlet_keys.json'
const keyTable = Object.keys(keys)

function list(value) {
  if (!Array.isArray(value)) {
    return `Wartość powinna być listą '[]'`
  }
  return
}

function map(value) {
  if (Array.isArray(value)) {
    return `Wartość powinna być obiektem '{}'`
  }
  return
}

function findInvalidGuilds(values: string[]): string | undefined {
  if (!Array.isArray(values)) {
    return
  }
  const invalidGuilds = values.filter(toCheck => validGuilds.indexOf(toCheck) <= -1);
  if (invalidGuilds.length > 0) {
    return `Dane wprowadzone w polu są nieprawidłowe. Brak gildii ${invalidGuilds.join(",")}`
  }
  return
}

function isValidKey(value: string) {
  if (!keyTable.includes(value as string) && value !== undefined && value !== '' && value !== undefined) {
    return `Klawisz jest nieprawidłowy, lista klawiszy:<br/><code>${keyTable.join(', ')}</code>`
  }
  return
}

export const validator = {
  guild: findInvalidGuilds,
  list: list,
  map: map,
  keybind: isValidKey
}
