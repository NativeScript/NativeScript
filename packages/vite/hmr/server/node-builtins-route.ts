import { builtinModules } from 'node:module';
import { isBuiltinModuleId } from '../../helpers/builtin-modules.js';

// `builtinModules` lists unprefixed names ('url', 'fs', 'fs/promises', ...).
const nodeBuiltinNames = builtinModules.filter((name) => !name.startsWith('node:'));

/**
 * Every `node:<name>` specifier the device import map is asked to resolve.
 * Only `node:`-prefixed forms: bare 'url' must keep resolving to the npm
 * package of that name.
 */
export function getNodeBuiltinSpecifiers(): string[] {
	const specifiers: string[] = [];
	for (const name of nodeBuiltinNames) {
		// Builtins kept for the runtime must reach its own shim.
		if (isBuiltinModuleId(`node:${name}`)) continue;
		specifiers.push(`node:${name}`);
	}
	return specifiers;
}
