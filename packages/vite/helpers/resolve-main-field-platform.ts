import path from 'path';
import fs from 'fs';
import { normalizeModuleId } from './normalize-id.js';

/**
 * Given a resolved package directory and its `package.json` `main` field, return
 * the platform-specific entry file to use (as a `normalizeModuleId`-canonical
 * absolute id), or `null` when no platform rewrite applies and normal resolution
 * should handle it.
 *
 * Shared by the two `enforce:'pre'` package resolvers (`nativescript-package-resolver`
 * and `package-platform-aliases`) so the main-field platform-variant rules live
 * in one place.
 *
 * Two cases (behavior preserved from the original inline implementations):
 *   1. `main` is extensionless → prefer `<main>.<platform>.js`, else `<main>.js`.
 *   2. `main` has an extension but the file is missing → try `<base>.<platform><ext>`.
 *
 * Note: when an extension-bearing `main` file DOES exist, this returns `null`
 * (the generic file wins) even if a `<base>.<platform><ext>` sibling exists.
 * That is the current, intentional-for-now behavior; revisiting it is tracked
 * separately (it would change resolution for packages shipping both).
 */
export function resolveMainFieldPlatformVariant(packagePath: string, mainField: string | undefined | null, platform: string): string | null {
	if (!mainField) return null;
	const mainFilePath = path.join(packagePath, mainField);

	// Case 1: extensionless main — add platform/.js extensions.
	if (!mainField.includes('.')) {
		const platformFile = path.join(packagePath, `${mainField}.${platform}.js`);
		if (fs.existsSync(platformFile)) return normalizeModuleId(platformFile);
		const jsFile = path.join(packagePath, `${mainField}.js`);
		if (fs.existsSync(jsFile)) return normalizeModuleId(jsFile);
		return null;
	}

	// Case 2: main has an extension but the file is missing — look for a platform variant.
	if (!fs.existsSync(mainFilePath)) {
		const ext = path.extname(mainField);
		const baseName = mainField.slice(0, -ext.length);
		const platformFile = path.join(packagePath, `${baseName}.${platform}${ext}`);
		if (fs.existsSync(platformFile)) return normalizeModuleId(platformFile);
		return null;
	}

	// Main file exists — let normal resolution handle it.
	return null;
}
