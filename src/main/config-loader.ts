import path from 'path'
import fs from 'fs'
import { dialog } from 'electron'
import { Config, ConfigResponse, Field, MudletSchema } from '../shared/Config'

const readmeSuffix: string = 'arkadia/config.md'
const schemaSuffix: string = 'arkadia/config_schema.json'
const mudletConfigPathSuffix: string = '/current'

const characterNameField = 'scripts.character_name'

const loadingFunction = (file: string) => `scripts_load_v2_config("${file}")`

export class ConfigLoader {
  readonly configPath: string
  readonly directory: string

  constructor(configPath: string) {
    this.configPath = configPath
    this.directory = path.dirname(configPath)
  }

  public async load(): Promise<ConfigResponse> {
    return Promise.all([
      this.readSchema(),
      this.readConfig(),
      this.readAllReadmes().then(this.parseReadme),
      this.checkLoadingTrigger()
    ]).then(([schema, config, readme, hasLoadingTrigger]): ConfigResponse => {
      const fields = schema.fields.reduce((map, definition) => {
        map.set(definition.name, {
          definition: definition,
          value: config[definition.name],
          description: readme[definition.name]
        })
        return map
      }, new Map<string, Field>())
      Object.entries(config).forEach(([key, value]) => {
        if (!fields.has(key)) {
          fields.set(key, {
            value: value!
          })
        }
      })

      return {
        name: (config[characterNameField] as string) ?? this.getNameFromPath(),
        directory: this.directory,
        path: this.configPath,
        fields: fields,
        hasLoadingTrigger: hasLoadingTrigger
      }
    })
  }

  private async readSchema(): Promise<MudletSchema> {
    const schemaPath: string = path.join(this.directory, schemaSuffix)
    const promises = [
      new Promise<MudletSchema>((resolve, reject) => {
        fs.readFile(schemaPath, 'utf-8', (err, data) => {
          if (err) {
            reject(err)
          }
          resolve(JSON.parse(data))
        })
      })
    ].concat(this.readPluginsSchemas())
    return Promise.all(promises).then((results) =>
      results.reduce(
        (schema, nextSchema) => {
          schema.fields = schema.fields.concat(nextSchema.fields)
          return schema
        },
        { fields: [] }
      )
    )
  }

  private readPluginsSchemas(): Promise<MudletSchema>[] {
    return fs
      .readdirSync(`${this.directory}/plugins`, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => `${this.directory}/plugins/${dirent.name}/config_schema.json`)
      .filter(fs.existsSync)
      .map(
        (configPath) =>
          new Promise<MudletSchema>((resolve) => {
            resolve(JSON.parse(fs.readFileSync(configPath, 'utf-8')))
          })
      )
  }

  private async readAllReadmes(): Promise<string> {
    return Promise.all([this.readReadme()].concat(this.readPluginsReadme())).then((result) =>
      result.reduce((prev, next) => prev + '\n' + next, '')
    )
  }

  private async readReadme(): Promise<string> {
    const readmePath: string = `${this.directory}/${readmeSuffix}`
    return new Promise<string>((resolve, reject) => {
      fs.readFile(readmePath, 'utf-8', (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
          dialog.showErrorBox(
            'Błąd oczytu pliku config.md',
            `Nie mogę odczytać pliku ${readmePath}. Wymagana wersja skryptów to 4.13+ lub plik konfiguracji znajduje się poza katalogiem profilu.`
          )
        }
      })
    })
  }

  private readPluginsReadme(): Promise<string>[] {
    return fs
      .readdirSync(`${this.directory}/plugins`, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => `${this.directory}/plugins/${dirent.name}/config.md`)
      .filter(fs.existsSync)
      .map((configPath) => new Promise((resolve) => resolve(fs.readFileSync(configPath, 'utf-8'))))
  }

  private parseReadme(readme: string): Record<string, string> {
    const result: Record<string, string> = {}

    let currentElements: string[] = []
    let currentDoc: string[] = []

    const lines = readme.replaceAll('---', '').split('\n')
    for (let line = 0; line < lines.length; line++) {
      const currentLine = lines[line]
      if (currentLine.startsWith('## ')) {
        const element = currentLine.substring(4, currentLine.length - 1)
        if (currentDoc.length <= 0) {
          currentElements.push(element)
        } else {
          if (currentElements.length > 0) {
            currentElements.forEach((element) => {
              result[element] = currentDoc.join('\n')
            })
          }
          currentElements = [element]
        }
        currentDoc = []
      } else {
        currentDoc.push(currentLine)
      }

      if (line == lines.length - 1) {
        currentElements.forEach((element) => {
          result[element] = currentDoc.join('\n')
        })
      }
    }

    return result
  }

  private async readConfig(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
      fs.readFile(this.configPath, 'utf-8', (err, data) => {
        if (err) {
          dialog.showErrorBox(
            'Plik konfiguracji nie istnieje',
            `Plik ${this.configPath} nie istnieje.\nJeżeli nie utworzyłeś jeszcze konfiguracji wywołaj w Mudlecie:\n/init imie imie_w_wolaczu`
          )
        }
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          dialog.showErrorBox(
            'Plik konfiguracji zawiera błędy',
            `Plik konfiguracji ${this.configPath} zawiera błędy lub nie jest to plik JSON.\n${e}`
          )
          reject(e)
        }
      })
    })
  }

  private async checkLoadingTrigger(): Promise<boolean> {
    const configs = fs.readdirSync(path.join(this.directory, mudletConfigPathSuffix), { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => path.resolve(file.path, file.name))
      .map(name => ({name, ctime: fs.statSync(name).ctime}))
      .sort((a, b) => b.ctime.getTime() - a.ctime.getTime())
    if (!configs[0]) {
      return false;
    }
    const contents = fs.readFileSync(configs[0].name, {encoding: 'utf-8'})
    return contents.indexOf(loadingFunction(this.getNameFromPath())) > -1
  }

  private getNameFromPath(): string {
    return path.basename(this.configPath, path.extname(this.configPath))
  }
}
