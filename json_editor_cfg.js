const settings = require('electron-settings');

const validGuilds = [
	"KM", "OS", "SGW", "GL", "KG", "CKN", "OHM", "MC", "WKS", "RA", "SC", "ZT", "PE", "KGKS", "ES", "GP", "ZH", "ZS", "NPC", "OK", "KS", "LE"
]

JSONEditor.defaults.languages.pl = {
	button_object_properties: "Pola obiektu"
};
JSONEditor.defaults.language = "pl"


JSONEditor.defaults.editors.filePath = class FilePathEditor extends JSONEditor.defaults.editors.string {
	build() {
		super.build();

		const elBtn = document.createElement('button');
		elBtn.type = 'button';
		elBtn.appendChild(document.createTextNode("Wybierz plik"));
		elBtn.classList.add('btn', 'btn-primary', 'btn-sm', "input-button");
		elBtn.addEventListener('click', (e) => this.clickHandler(e));

		this.control.insertBefore(elBtn, this.control.querySelector("input").nextSibling);
	}
	clickHandler(e) {
		dialog.showOpenDialog().then(result => { if (result.filePaths[0]) { this.setValue(result.filePaths[0].replaceAll("\\", '/')) } })
	}
};

JSONEditor.defaults.editors.passwordEditor = class PasswordEditor extends JSONEditor.defaults.editors.string {
	build() {
		super.build();

		const elBtn = document.createElement('div');
		elBtn.classList.add("show-password")
		this.link = document.createElement('span')
		this.link.appendChild(document.createTextNode("Pokaż"))
		elBtn.appendChild(this.link);
		elBtn.classList.add("input-group-addon");
		this.link.addEventListener('click', (e) => this.clickHandler(e));

		this.control.insertBefore(elBtn, this.control.querySelector("input").nextSibling);
		this.password = this.control.querySelector("input");
	}
	clickHandler(e) {
		e.preventDefault();
		let isPassword = this.password.getAttribute("type") == "password";
		this.password.setAttribute("type", isPassword ? "text" : "password");
		this.link.innerHTML = isPassword ? "Ukryj" : "Pokaż";
	}
};

JSONEditor.defaults.resolvers.unshift(function (schema) {
	if (schema.type === 'string' && schema.format == "file_path") {
		return 'filePath';
	}
	if (schema.type === 'string' && schema.format == "password") {
		return 'passwordEditor';
	}
});

JSONEditor.defaults.custom_validators.push((schema, value, path) => {
	const errors = [];
	if (schema.format === "textarea" && !settings.getSync('visual-edit')) {
		let obj;
		try {
			obj = JSON.parse(value);
			if (schema.contentType === "guild" && !settings.getSync('visual-edit') && value !== "") {
				obj.forEach(val => {
					if(!validGuilds.includes(val)) {
						errors.push({
							path: path,
							property: 'format',
							message: `Dane wprowadzone w polu ${path} są nieprawidłowe. Brak gildii ${val}`
						});
					}
				})
			}
		} catch(e) {
			errors.push({
				path: path,
				property: 'format',
				message: `Dane wprowadzone w polu ${path} są nieprawidłowe. Sprawdź nawiasy, przecinki, cudzysłowia. Szczegóły błędu: ${e}`
			});
		}
	}

	return errors;
});