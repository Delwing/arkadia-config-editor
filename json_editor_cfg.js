JSONEditor.defaults.languages.pl = {
    button_object_properties : "Pola obiektu"
};
JSONEditor.defaults.language = "pl"


JSONEditor.defaults.editors.filePath = class myeditor extends JSONEditor.defaults.editors.string {
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
		dialog.showOpenDialog().then(result => { if (result.filePaths[0]) {this.setValue(result.filePaths[0].replaceAll("\\", '/')) } })
	}
};

JSONEditor.defaults.resolvers.unshift(function(schema) {
    if (schema.type === 'string' && schema.format == "file_path") {
        return 'filePath';
    }
});