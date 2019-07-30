import * as fs from "../file-system/file-system";
import * as appCommonModule from "../application/application-common";

const cache = new Set<string>();
let initialized = false;

function register(name, loader) {
    global.registerModule(name, loader);
}

function processFile(file: fs.File) {
    const filePathRelativeToApp = file.path.substr(fs.knownFolders.currentApp().path.length + 1);
    const loadContent = () => file.readTextSync();

    switch (file.extension.toLocaleLowerCase()) {
        case ".js":
            const noExtPath = filePathRelativeToApp.substr(0, filePathRelativeToApp.length - ".js".length);

            register(filePathRelativeToApp, function () { return global.require(file.path); });
            register(noExtPath, function () { return global.require(file.path); });
            break;

        case ".css":
            register(filePathRelativeToApp, loadContent);
            break;

        case ".xml":
            register(filePathRelativeToApp, loadContent);
            break;
    }

    if (file.name === "package.json") {
        const json = global.require(file.path);
        if (json.main) {
            let name = filePathRelativeToApp.substr(0, filePathRelativeToApp.length - "package.json".length - 1);
            let requirePath = fs.path.join(file.parent.path, json.main);

            if (name.startsWith("tns_modules")) {
                name = name.substr("tns_modules".length + 1);
            }

            register(name, () => global.require(requirePath));
        }
    }
}

function processFolder(path: string) {
    if (fs.Folder.exists(path)) {
        const folder = fs.Folder.fromPath(path);

        folder.eachEntity((file) => {
            if (file instanceof fs.File) {
                processFile(file);
            }

            return true;
        });
    }
}

/**
 * Registers loaders for all files from the containing folder with global.registerModule().
 * Compatibility method for non-webpack workflow (like in playground). 
 * @param moduleName 
 */
export function registerModulesFromFileSystem(moduleName: string) {
    initialize();

    if (cache.has(moduleName)) {
        return;
    }
    cache.add(moduleName);

    // moduleName is a folder with package.json
    const path = fs.path.join(fs.knownFolders.currentApp().path, moduleName);
    if (fs.Folder.exists(path)) {
        processFolder(path);

        return;
    }

    // moduleName is file - load all files in it's folder
    const parentName = moduleName.substr(0, moduleName.lastIndexOf(fs.path.separator));
    const parentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, parentName);
    if (fs.Folder.exists(parentFolderPath)) {
        processFolder(parentFolderPath);

        return;
    }

    // moduleName is a folder in tns_modules ex. "nativescript-ui-chart"
    const tnsModulesPath = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", moduleName);
    if (fs.Folder.exists(tnsModulesPath)) {
        processFolder(tnsModulesPath);

        return;
    }

    // moduleName a file in tns_modules/plugin. Avoid traversing the whole tns_modules folder if parentName is empty
    if (parentName) {
        const tnsParentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", parentName);
        if (fs.Folder.exists(tnsParentFolderPath)) {
            processFolder(tnsParentFolderPath);

            return;
        }
    }
}

function initialize() {
    if (!initialized) {
        appCommonModule.on("livesync", args => cache.clear());
        initialized = true;
    }
}