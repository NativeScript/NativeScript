import { afterEach, describe, expect, it } from 'vitest';

import { nativescriptBuiltinModules, resetBuiltinModules } from '../../helpers/builtin-modules.js';
import { getNodeBuiltinSpecifiers } from './node-builtins-route.js';
import { isLikelyNativeScriptPluginSpecifier } from './websocket-module-specifiers.js';

describe('runtime builtin modules under HMR', () => {
	afterEach(() => resetBuiltinModules());

	it('does not treat ns: builtins as NativeScript plugins', () => {
		expect(isLikelyNativeScriptPluginSpecifier('ns:util')).toBe(false);
	});

	it('drops opted-in node: builtins from the dev import map', () => {
		nativescriptBuiltinModules({ include: ['node:worker_threads'] });
		const specifiers = getNodeBuiltinSpecifiers();

		expect(specifiers).not.toContain('node:worker_threads');
		expect(specifiers).toContain('node:fs');
	});
});
