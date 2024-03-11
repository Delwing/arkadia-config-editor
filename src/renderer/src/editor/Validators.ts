const validGuilds = [
  "KM", "OS", "SGW", "GL", "KG", "CKN", "OHM", "MC", "WKS", "RA", "SC", "ZT", "PE", "KGKS", "ES", "GP", "ZH", "ZS", "NPC", "OK", "KS", "LE"
]

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

export const validator = {
  guild: findInvalidGuilds,
  list: list,
  map: map
}
