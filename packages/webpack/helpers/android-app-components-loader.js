const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function (source, map) {
    this.cacheable();
    const { modules } = this.query;
    const imports = modules.map(convertSlashesInPath)
        .map(m => `require("${m}");`).join("\n");
    const augmentedSource = `
        const isAndroid = require("@nativescript/core").isAndroid;
        if (isAndroid && !global["__snapshot"]) {
            ${imports}
        }

        ${source}
    `;

    this.callback(null, augmentedSource, map);
};
