const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function (source, map) {
    this.cacheable();
    const { modules } = this.query;
    const imports = modules.map(convertSlashesInPath)
        .map(m => `require("${m}");`).join("\n");
    const augmentedSource = `
        let applicationCheckPlatform = require("@nativescript/core/application");
        if (applicationCheckPlatform.android && !global["__snapshot"]) {
            ${imports}
        }

        ${source}
    `;

    this.callback(null, augmentedSource, map);
};
