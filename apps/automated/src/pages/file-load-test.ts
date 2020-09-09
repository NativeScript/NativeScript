import { Page, Label, knownFolders, path, ModuleNameResolver } from '@nativescript/core';

export function createPage() {
	var page = new Page();
	var lbl = new Label();

	var moduleName = 'tests/pages/files/test';

	ModuleNameResolver;
	var resolver = new ModuleNameResolver({
		width: 400,
		height: 600,
		os: 'android',
		deviceType: 'phone',
	});

	// Current app full path.
	var currentAppPath = knownFolders.currentApp().path;
	var moduleNamePath = path.join(currentAppPath, moduleName);

	var fileName = resolver.resolveModuleName(moduleNamePath, 'xml');
	lbl.text = fileName;
	lbl.textWrap = true;

	page.content = lbl;

	return page;
}
