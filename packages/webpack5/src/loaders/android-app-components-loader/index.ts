import { Utils } from '../..';

export default function loader(content, map) {
    this.cacheable();
    const { modules } = this.query;
    console.log('android-app-component-loader', modules);
    const imports = modules.map(Utils.project.convertSlashesInPath)
        .map(m => `require("${m}");`).join("\n");
    const augmentedSource = `
        if (global.isAndroid) {
            ${imports}
        }

        ${content}
    `;

    this.callback(null, augmentedSource, map);
};
