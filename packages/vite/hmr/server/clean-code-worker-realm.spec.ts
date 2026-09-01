import { describe, expect, it } from 'vitest';
import { cleanCode } from './process-code-for-device.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';

const GLOBALS_IMPORT = `import "/node_modules/@nativescript/core/globals/index.js?v=abc";`;
const BODY = `${GLOBALS_IMPORT}\nexport const tick = () => setInterval(() => {}, 33);\n`;

describe('cleanCode — @nativescript/core/globals side-effect import', () => {
	it('strips it for a main-realm serve (the entry installs globals once)', () => {
		const out = cleanCode(BODY, typescriptServerStrategy);
		expect(out).not.toContain('core/globals');
		expect(out).toContain('export const tick');
	});

	it('keeps it for a worker-realm serve (the worker script is that realm’s only entry)', () => {
		const out = cleanCode(BODY, typescriptServerStrategy, { workerRealm: true });
		expect(out).toContain(GLOBALS_IMPORT);
	});
});

describe('ensureWorkerEntryGlobalsImport', () => {
	it('adds the globals import to a worker entry that lacks it', async () => {
		const { ensureWorkerEntryGlobalsImport } = await import('./websocket-served-module-helpers.js');
		const out = ensureWorkerEntryGlobalsImport(`globalThis.onmessage = () => {};\n`);
		expect(out.startsWith(`import '@nativescript/core/globals';\n`)).toBe(true);
	});

	it('leaves a worker entry that already imports globals (in any resolved form) alone', async () => {
		const { ensureWorkerEntryGlobalsImport } = await import('./websocket-served-module-helpers.js');
		for (const line of [`import '@nativescript/core/globals';`, `import "/node_modules/@nativescript/core/globals/index.js?v=abc";`, `import "http://h:5173/ns/core/globals";`]) {
			const code = `${line}\nexport {};\n`;
			expect(ensureWorkerEntryGlobalsImport(code)).toBe(code);
		}
	});
});
