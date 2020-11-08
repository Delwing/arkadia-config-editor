const fs = require("fs");
const showdown = require("showdown");
const hljs = require("highlightjs");
const path = require("path");

const converter = new showdown.Converter();
const editorHolder = document.getElementById("editor-holder");

const readmeSuffix = "arkadia/config.md";
const schemaSuffix = "arkadia/config_schema.json";

let editor;

class ConfigLoader {
  constructor(configPath) {
    this.path = path.dirname(configPath);
    this.configPath = configPath;
    this.readmePath = `${this.path}/${readmeSuffix}`;
    this.schemaPath = `${this.path}/${schemaSuffix}`;
  }

  load() {

    if(editor) {
        editor.destroy()
    }
    
    editorHolder.scrollTop = 0


    const sourceSchema = JSON.parse(fs.readFileSync(this.schemaPath, "utf-8"));
    const config = JSON.parse(fs.readFileSync(this.configPath, "utf-8"));
    const readme = fs.readFileSync(this.readmePath, "utf-8");

    let readmeParsed = this.parseReadme(readme);

    this.schema = {
      title: config["scripts.character_name"] || "{unknown name}",
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
      };

      if (["list", "map"].includes(element.field_type)) {
        this.schema.properties[element.name].transformer = JSON.parse;
      }

      keys.add(element.name);
    });

    Object.keys(config).forEach((element) => {
      keys.add(element);
    });

    let entriesIndex = document.getElementById("entries-index");
    entriesIndex.innerHTML = "";
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
    prompt_before_delete: false,
    object_layout: "table",
    });

    editor.setValue(config);

    for (const key in readmeParsed) {
      if (readmeParsed.hasOwnProperty(key)) {
        const element = readmeParsed[key];
        let selector = document.body.querySelector(
          '[data-schemapath="root.' + key + '"]'
        );
        if (selector !== null) {
          selector.querySelector("small").innerHTML = converter.makeHtml(
            element
          );
        } else {
          console.debug("No selector: " + key);
        }
      }
    }

    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });

    let that = this;
    document
      .querySelector(".save-button")
      .addEventListener("click", function (e) {
        that.save();
        let toast = document.querySelector(".toast-center");
        toast.className += " visible";
        setTimeout(function () {
          toast.className = toast.className.replace("visible", "").trim();
        }, 3500);
      });
  }

  save() {
    let value = {};
    Object.assign(value, editor.getValue());
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const element = value[key];
        if (this.schema.properties[key]?.transformer) {
          value[key] = this.schema.properties[key].transformer(element);
        }
      }
    }
    fs.writeFileSync(this.configPath, JSON.stringify(value, null, 4));
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
    }

    return result;
  }

  mapFieldType(type) {
    switch (type) {
      case "map":
        return "string";
      case "list":
        return "string";
      default:
        return type;
    }
  }
}

module.exports = {
  ConfigLoader: ConfigLoader,
};
