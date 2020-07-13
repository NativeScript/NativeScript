import * as fs from '../file-system';
import * as appCommonModule from '../application/application-common';
import { Trace } from '../trace';

const cache = new Set<string>();
let initialized = false;

function register(name: string, loader: (name?: string) => void) {
	if (Trace.isEnabled()) {
		Trace.write(`[Compat] Register module: ${name}`, Trace.categories.ModuleNameResolver);
	}
	global.registerModule(name, loader);

	if (name.startsWith('tns_modules')) {
		const nonTnsModulesName = name.substr('tns_modules'.length + 1);
		if (Trace.isEnabled()) {
			Trace.write(`[Compat] Register module: ${nonTnsModulesName}`, Trace.categories.ModuleNameResolver);
		}
		global.registerModule(nonTnsModulesName, loader);
	}
}

function processFile(file: fs.File) {
	const filePathRelativeToApp = file.path.substr(fs.knownFolders.currentApp().path.length + 1);
	const loadContent = () => file.readTextSync();

	switch (file.extension.toLocaleLowerCase()) {
		case '.js':
			const noExtPath = filePathRelativeToApp.substr(0, filePathRelativeToApp.length - '.js'.length);

			register(filePathRelativeToApp, function () {
				return global.require(file.path);
			});
			register(noExtPath, function () {
				return global.require(file.path);
			});
			break;

		case '.css':
			register(filePathRelativeToApp, loadContent);
			break;

		case '.xml':
			register(filePathRelativeToApp, loadContent);
			break;
	}

	if (file.name === 'package.json') {
		const json = global.require(file.path);
		if (json.main) {
			let name = filePathRelativeToApp.substr(0, filePathRelativeToApp.length - 'package.json'.length - 1);
			let requirePath = fs.path.join(file.parent.path, json.main);

			register(name, () => global.require(requirePath));
		}
	}
}

/**
 * Processes folder and returns true if folder was not empty.
 * @param Folder path
 */
function processFolder(path: string): boolean {
	if (cache.has(path)) {
		return true;
	}
	cache.add(path);

	if (Trace.isEnabled()) {
		Trace.write(`[Compat] Processing folder: ${path}`, Trace.categories.ModuleNameResolver);
	}

	let folderEmpty = true;

	if (fs.Folder.exists(path)) {
		const folder = fs.Folder.fromPath(path);

		folder.eachEntity((file) => {
			if (file instanceof fs.File) {
				processFile(file);
				folderEmpty = false;
			}

			return true;
		});
	}

	return !folderEmpty;
}

/**
 * Registers loaders for all files from the containing folder with global.registerModule().
 * Compatibility method for non-webpack workflow (like in playground).
 * @param moduleName
 */
export function registerModulesFromFileSystem(moduleName: string) {
	initialize();

	let folderProcessed = false;
	let parentFolderProcessed = false;
	// moduleName is a folder with package.json
	const path = fs.path.join(fs.knownFolders.currentApp().path, moduleName);
	if (fs.Folder.exists(path)) {
		folderProcessed = processFolder(path);
	}

	// moduleName is file - load all files in its parent folder
	const parentName = moduleName.substr(0, moduleName.lastIndexOf(fs.path.separator));
	const parentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, parentName);
	if (fs.Folder.exists(parentFolderPath)) {
		parentFolderProcessed = processFolder(parentFolderPath);
	}

	// Return only if we processed the actual folder or its parent folder.
	// If the parent folder is empty we should still check tns_modules
	// as this might be just a name of a plugin (ex. "nativescript-ui-autocomplete")
	if (folderProcessed || (parentFolderProcessed && parentName)) {
		return;
	}

	// moduleName is a folder in tns_modules ex. "nativescript-ui-chart"
	const tnsModulesPath = fs.path.join(fs.knownFolders.currentApp().path, 'tns_modules', moduleName);
	if (fs.Folder.exists(tnsModulesPath)) {
		processFolder(tnsModulesPath);
	}

	// moduleName a file in tns_modules/plugin. Avoid traversing the whole tns_modules folder if parentName is empty
	if (parentName) {
		const tnsParentFolderPath = fs.path.join(fs.knownFolders.currentApp().path, 'tns_modules', parentName);
		if (fs.Folder.exists(tnsParentFolderPath)) {
			processFolder(tnsParentFolderPath);
		}
	}
}

function initialize() {
	if (!initialized) {
		appCommonModule.on('livesync', (args) => cache.clear());
		initialized = true;
	}
}
