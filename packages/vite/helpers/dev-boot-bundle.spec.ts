import fs from 'node:fs';
import { transformSync } from 'esbuild';
import { init, parse } from 'es-module-lexer';
import { describe, expect, it } from 'vitest';
import { BOOT_TIMER_PRELUDE, composeDevBootBundle, devBootLoaderOptions } from './dev-boot-bundle.js';

const compiledLoader = () => transformSync(fs.readFileSync(new URL('../runtime/dev-boot-loader.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'esm' }).code + '//# sourceMappingURL=dev-boot-loader.js.map';

describe('devBootLoaderOptions', () => {
	it('points the loader at the served dev boot module', () => {
		expect(devBootLoaderOptions('http://192.168.1.5:5173', 'tok', false)).toEqual({
			origin: 'http://192.168.1.5:5173',
			bootUrl: 'http://192.168.1.5:5173/@id/__x00__virtual:ns-dev-boot',
			token: 'tok',
			verbose: false,
		});
	});
});

describe('composeDevBootBundle', () => {
	it('is the timer prelude, the compiled loader and one call, with no static import', async () => {
		const options = devBootLoaderOptions('http://192.168.1.5:5173', 'tok', true);
		const bundle = composeDevBootBundle(compiledLoader(), options);
		expect(bundle.startsWith(`${BOOT_TIMER_PRELUDE}\n`)).toBe(true);
		expect(bundle.endsWith(`\nawait bootFromDevServer(${JSON.stringify(options)});\n`)).toBe(true);
		expect(bundle).not.toContain('sourceMappingURL');
		await init;
		const [imports] = parse(bundle);
		expect(imports.filter((entry) => entry.d === -1)).toEqual([]);
	});
});
