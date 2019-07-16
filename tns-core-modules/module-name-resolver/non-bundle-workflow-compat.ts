import * as fs from "../file-system/file-system";
import * as appCommonModule from "../application/application-common";
import {
    isEnabled as traceEnabled,
    write as traceWrite,
    categories as traceCategories
} from "../trace";

const cache = new Set<string>();
let initialized = false;

function register(name, loader) {
    if (traceEnabled()) {
        traceWrite(`[Compat] Register module: ${name}`, traceCategories.ModuleNameResolver);
    }
    global.registerModule(name, loader);

    if (name.startsWith("tns_modules")) {
        const nonTnsModulesName = name.substr("tns_modules".length + 1);
        if (traceEnabled()) {
            traceWrite(`[Compat] Register module: ${nonTnsModulesName}`, traceCategories.ModuleNameResolver);
        }
        global.registerModule(nonTnsModulesName, loader);
    }
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

            register(name, () => global.require(requirePath));
        }
    }
}

function processFolder(path: string) {
    if (cache.has(path)) {
        return;
    }
    cache.add(path);

    if (traceEnabled()) {
        traceWrite(`[Compat] Processing folder: ${path}`, traceCategories.ModuleNameResolver);
    }

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

    let folderFound = false;
    // moduleName is a folder with package.json
    const path = fs.path.join(fs.knownFolders.currentApp().path, moduleName);
    if (fs.Folder.exists(path)) {
        processFolder(path);
        folderFound = true;
    }

    // moduleName is file - load all files in its parent folder
    const parentName = moduleName.substr(0, moduleName.lastIndexOf(fs.path.separator));
    const parentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, parentName);
    if (fs.Folder.exists(parentFolderPath)) {
        processFolder(parentFolderPath);
        folderFound = true;
    }

    if (folderFound) {
        return;
    }

    // moduleName is a folder in tns_modules ex. "nativescript-ui-chart"
    const tnsModulesPath = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", moduleName);
    if (fs.Folder.exists(tnsModulesPath)) {
        processFolder(tnsModulesPath);
    }

    // moduleName a file in tns_modules/plugin. Avoid traversing the whole tns_modules folder if parentName is empty
    if (parentName) {
        const tnsParentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", parentName);
        if (fs.Folder.exists(tnsParentFolderPath)) {
            processFolder(tnsParentFolderPath);
        }
    }
}

function initialize() {
    if (!initialized) {
        appCommonModule.on("livesync", args => cache.clear());
        initialized = true;
    }
}