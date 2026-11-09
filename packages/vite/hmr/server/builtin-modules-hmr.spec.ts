import { afterEach, describe, expect, it } from 'vitest';

import { nativescriptBuiltinModules, resetBuiltinModules } from '../../helpers/builtin-modules.js';
import { rewriteSpecifiersForDevice } from './core-sanitize.js';
import { getNodeBuiltinImportMapEntries } from './node-builtins-route.js';
import { processCodeForDevice } from './process-code-for-device.js';
import { ensureNativeScriptModuleBindings } from './websocket-module-bindings.js';
import { isLikelyNativeScriptPluginSpecifier } from './websocket-module-specifiers.js';

const ORIGIN = 'http://localhost:5173';

describe('runtime builtin modules under HMR', () => {
	afterEach(() => resetBuiltinModules());

	it('serves /@id/-wrapped builtins to the device verbatim', () => {
		nativescriptBuiltinModules({ include: ['node:worker_threads'] });
		const code = [`import { inspect } from "/@id/ns:util";`, `import "/@id/ns:runtime";`, `export * from "/@id/node:worker_threads";`, `console.log(inspect);`].join('\n');

		const output = processCodeForDevice(code, false, true, true, '/node_modules/dep/index.js');

		expect(output).toContain(`from "ns:util"`);
		expect(output).toContain(`import "ns:runtime"`);
		expect(output).toContain(`from "node:worker_threads"`);
		expect(output).not.toContain('/@id/');
	});

	it('keeps builtin imports out of the worker realm /ns/m routing', () => {
		const output = ensureNativeScriptModuleBindings(`import { inspect } from 'ns:util';\nimport 'ns:runtime';\nconsole.log(inspect);`, { vendorImportsAsHttp: true });

		expect(output).toContain(`import { inspect } from 'ns:util';`);
		expect(output).toContain(`import 'ns:runtime';`);
		expect(output).not.toContain('/ns/m/');
		expect(isLikelyNativeScriptPluginSpecifier('ns:util')).toBe(false);
	});

	it('leaves builtins alone when rewriting core modules', () => {
		const output = rewriteSpecifiersForDevice(`import { inspect } from "ns:util";\nimport { Worker } from "/@id/ns:worker_threads";`, ORIGIN, 0);

		expect(output).toContain(`from "ns:util"`);
		expect(output).toContain(`from "ns:worker_threads"`);
		expect(output).not.toContain('/ns/m/');
	});

	it('drops opted-in node: builtins from the dev import map', () => {
		nativescriptBuiltinModules({ include: ['node:worker_threads'] });
		const entries = getNodeBuiltinImportMapEntries(ORIGIN);

		expect(entries['node:worker_threads']).toBeUndefined();
		expect(entries['node:fs']).toBe(`${ORIGIN}/ns/node/fs`);
	});
});
