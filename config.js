const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

const fs = require("fs");
const showdown = require("showdown");
const hljs = require("highlightjs");
const path = require("path");
const settings = require('electron-settings');

const converter = new showdown.Converter();
const editorHolder = document.getElementById("editor-holder");
const spinner = document.querySelector(".spinner")
const entriesIndex = document.getElementById("entries-index")
const toast = document.querySelector(".toast-center");

const readmeSuffix = "arkadia/config.md";
const schemaSuffix = "arkadia/config_schema.json";

const mudletColors = require('./mudlet_colors.json')
const mudletKeyModifiers = require('./mudlet_key_modifiers.json')

require("./json_editor_cfg.js")

let editor;

class ConfigLoader {
  constructor() {
    document
      .querySelector(".save-button")
      .addEventListener("click", function (e) {
        this.save();
      }.bind(this));

    ipcRenderer.on('save', function () { this.save() }.bind(this))
    ipcRenderer.on('option', function (e, args) { this.reload() }.bind(this))
  }

  load(configPath) {
    this.configPath
    spinner.style.display = 'flex'
    new Promise(function (resolve, err) { this.doLoad(configPath) }.bind(this)).then(() => spinner.style.display = 'none')
  }

  async doLoad(configPath) {

    if (editor) {
      editor.destroy()
      entriesIndex.innerHTML = ''
    }

    editorHolder.scrollTop = 0

    this.path = path.dirname(configPath);
    this.configPath = configPath;
    this.readmePath = `${this.path}/${readmeSuffix}`;
    this.schemaPath = `${this.path}/${schemaSuffix}`;



    let promise1 = new Promise(function (resolve, reject) {
      fs.readFile(this.schemaPath, "utf-8", (err, data) => {
        resolve(JSON.parse(data))
      });
    }.bind(this))
    let promise2 = new Promise(function (resolve, reject) {
      fs.readFile(this.configPath, "utf-8", (err, data) => {
        try {
          let result = JSON.parse(data)
          resolve(result)
        } catch (e) {
          if (!fs.existsSync(this.configPath)) {
            dialog.showErrorBox("Plik konfiguracji nie istnieje", `Plik ${this.configPath} nie istnieje.\nJeżeli nie utworzyłeś jeszcze konfiguracji wywołaj w Mudlecie:\n/init imie imie_w_wolaczu`)
          } else {
            dialog.showErrorBox("Plik konfiguracji zawiera błędy", `Plik konfiguracji ${this.configPath} zawiera błędy lub nie jest to plik JSON.\n${e}`)
          }
          reject(e)
        }
      });
    }.bind(this))
    let promies3 = new Promise(function (resolve, reject) {
      fs.readFile(this.readmePath, "utf-8", (err, data) => {
          if(!err) {
            resolve(data)
          } else {
            reject(err)
            dialog.showErrorBox("Błąd oczytu pliku config.md", `Nie mogę odczytać pliku ${this.readmePath}. Wymagana wersja skryptów to 4.13+ lub plik konfiguracji znajduje się poza katalogiem profilu.`)
          }
        
      });
    }.bind(this))

    Promise.all([promise1, promise2, promies3]).then((value) => {

      const sourceSchema = value[0];
      const config = value[1];
      let readme = value[2];

      fs.readdirSync(`${this.path}/plugins`, {withFileTypes: true} )
        .filter(dirent => dirent.isDirectory())
        .map(dirent => `${this.path}/plugins/${dirent.name}/config_schema.json`)
        .filter(fs.existsSync)
        .map(configPath => fs.readFileSync(configPath, 'utf-8'))
        .map(JSON.parse)
        .forEach(schema => sourceSchema.fields = sourceSchema.fields.concat(schema.fields))

      fs.readdirSync(`${this.path}/plugins`, {withFileTypes: true} )
        .filter(dirent => dirent.isDirectory())
        .map(dirent => `${this.path}/plugins/${dirent.name}/config.md`)
        .filter(fs.existsSync)
        .map(configPath => fs.readFileSync(configPath, 'utf-8'))
        .forEach(pluginReadme => readme += "\n" + pluginReadme)

      let readmeParsed = this.parseReadme(readme);

      this.schema = {
        title: config["scripts.character_name"] || "{unknown name}",
        description: this.configPath,
        type: "object",
        properties: {},
        default: "",
      };

      let keys = new Set();

      sourceSchema.fields.forEach((element) => {
        let description = converter.makeHtml(readmeParsed[element.name]);
        let type = this.mapFieldType(element.field_type);
        this.schema.properties[element.name] = {
          type: type,
          description: description,
          format: element.content_type,
          contentType:  element.content_type,
          implicit: element.implicit,
          default_value: element.default_value
        };

        if (["list", "map"].includes(element.field_type)) {
          this.schema.properties[element.name].format = "textarea"
          this.schema.properties[element.name].transformer = JSON.parse;
        }

        if (element.content_type == "mudlet_color") {
          this.schema.properties[element.name].enum = mudletColors;
          this.schema.properties[element.name].format = "choices"
        }

        if (element.content_type == "key_modifiers") {
            this.schema.properties[element.name].type = "array"
            this.schema.properties[element.name].format = "checkbox"
            this.schema.properties[element.name].uniqueItems = true,
            this.schema.properties[element.name].items = {
                "type": "string",
                "enum": mudletKeyModifiers
              }
        }

        keys.add(element.name);
      });

      Object.keys(config).forEach((element) => {
        keys.add(element);
      });

      Array.from(keys)
        .sort()
        .forEach((key) => {
          let listElement = document.createElement("li");
          listElement.addEventListener("click", function () {
            let elmnt = document.body.querySelector(
              '[data-schemapath="root.' + key + '"]'
            );
            elmnt.scrollIntoView();
            elmnt.querySelector("input, select").focus();
          });
          listElement.innerHTML = key;
          entriesIndex.appendChild(listElement);
        });

      editor = new JSONEditor(editorHolder, {
        schema: this.schema,
        theme: "bootstrap4",
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        disable_array_delete_last_row: true,
        disable_array_delete_all_rows: true,
        prompt_before_delete: false,
        object_layout: "normal",
        required_by_default: true
      });

      editor.setValue(config);

      for (const key in readmeParsed) {
        if (readmeParsed.hasOwnProperty(key)) {
          const element = readmeParsed[key];
          let selector = document.body.querySelector(
            '[data-schemapath="root.' + key + '"]'
          );
          if (selector !== null) {
            let small = selector.querySelector("small, h3 ~ p")
            let description = converter.makeHtml(element.replace("\ ", "  "));
            if (this.schema.properties[key].default_value) {
                let defaultValue = JSON.stringify(this.schema.properties[key].default_value, null, 4).replace(/^"(.*)"$/, "$1")
                description = description.substring(0, description.lastIndexOf("<hr />"))
                description += `<p class="set-default">Domyślna wartość:<br><a class="set" href="#">ustaw</a><pre><code>${defaultValue}</code></pre></p>`
                description += "<hr />"
                small.innerHTML = description
                small.querySelectorAll("a.set").forEach((element) => {
                    element.addEventListener("click", (e) => {
                        e.preventDefault();
                        let setDefaultValue = this.schema.properties[key].default_value
                        if (this.schema.properties[key].format === "textarea") {
                            setDefaultValue = defaultValue
                        }
                        editor.getEditor(`root.${key}`).setValue(setDefaultValue)
                        selector.querySelectorAll("textarea").forEach(element => {
                            element.style.height = ""
                            element.style.height = element.scrollHeight + "px";
                        })
                    })
                  });
            } else {
                small.innerHTML = description
            }
          } else {
            console.debug("No selector: " + key);
          }
        }
      }

      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });
      

      document.querySelectorAll("textarea").forEach(textarea => {
        if (textarea.value) {
          try {
            let obj = JSON.parse(textarea.value)
            textarea.value = JSON.stringify(obj, null, 4)
            textarea.style.height = ""
            textarea.style.height = textarea.scrollHeight + "px";
          } catch (error) {
            console.error(textarea)
            console.error(textarea.value)
            console.error(error)
          }
        }
        textarea.addEventListener("input", function (event) {
          event.target.style.height = ""
          event.target.style.height = event.target.scrollHeight + "px";
        })
        textarea.addEventListener("keydown", function (e) {
          if (e.code === "Tab") {
            let tab = "    "
            let startPos = e.target.selectionStart;
            let endPos = e.target.selectionEnd;
            e.target.value = e.target.value.substring(0, startPos) + tab + e.target.value.substring(endPos, e.target.value.length);
            e.target.selectionStart = startPos + tab.length;
            e.target.selectionEnd = startPos + tab.length;
            e.preventDefault()
          }
        })
      })

    })
  }

  save() {
    let value = {};
    Object.assign(value, editor.getValue());
    let validationErrors = editor.validate(value)
    if (validationErrors.length > 0) {
      let key = validationErrors[0]
      let elmnt = document.body.querySelector(
        '[data-schemapath="' + key.path + '"]'
      );
      elmnt.scrollIntoView()
      return
    }
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const element = value[key];
        if (this.schema.properties[key]?.transformer && this.schema.properties[key]?.type == "string") {
          value[key] = this.schema.properties[key].transformer(element);
        }
        if(value[key] == null || (value[key] == "" && this.schema.properties[key]?.implicit)) {
          delete value[key]
        }
      }
    }
    fs.writeFileSync(this.configPath, JSON.stringify(value, null, 4));
    ipcRenderer.send("config-saved", this.configPath)

    toast.className += " visible";
    setTimeout(function () {
      toast.className = toast.className.replace("visible", "").trim();
    }, 3500);
  }

  reload() {
    this.load(this.configPath)
  }

  destroy() {
    editor.destroy();
  }

  parseReadme(readme) {
    let result = {};

    let currentElements = [];
    let currentDoc = [];

    var lines = readme.split("\n");
    for (var line = 0; line < lines.length; line++) {
      let currentLine = lines[line];
      if (currentLine.startsWith("## ")) {
        let element = currentLine.substring(4, currentLine.length - 1);
        if (currentDoc.length <= 0) {
          currentElements.push(element);
        } else {
          if (currentElements.length > 0) {
            currentElements.forEach((element) => {
              result[element] = currentDoc.join("\n");
            });
          }
          currentElements = [element];
        }
        currentDoc = [];
      } else {
        currentDoc.push(currentLine);
      }

      if (line == lines.length - 1) {
        currentElements.forEach((element) => {
          result[element] = currentDoc.join("\n");
        });
      }
    }

    return result;
  }

  mapFieldType(type) {
    switch (type) {
      case "map":
        return settings.getSync('visual-edit') ? "object" : "string";
      case "list":
        return settings.getSync('visual-edit') ? "array" : "string";
      default:
        return type;
    }
  }
}

module.exports = {
  ConfigLoader: ConfigLoader,
};