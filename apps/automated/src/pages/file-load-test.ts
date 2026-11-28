import { Page, Label, knownFolders, path, ModuleNameResolver } from '@nativescript/core';

export function createPage() {
	const page = new Page();
	const lbl = new Label();

	const moduleName = 'tests/pages/files/test';

	const resolver = new ModuleNameResolver({
		width: 400,
		height: 600,
		os: 'android',
		deviceType: 'phone',
	});

	// Current app full path.
	const currentAppPath = knownFolders.currentApp().path;
	const moduleNamePath = path.join(currentAppPath, moduleName);

	const fileName = resolver.resolveModuleName(moduleNamePath, 'xml');
	lbl.text = fileName;
	lbl.textWrap = true;

	page.content = lbl;

	return page;
}
