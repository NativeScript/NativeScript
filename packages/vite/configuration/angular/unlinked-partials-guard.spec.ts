import { describe, expect, it, vi } from 'vitest';

import { angularUnlinkedPartialsGuardPlugin } from './unlinked-partials-guard.js';

const partial = ["import * as i0 from '@angular/core';", 'export class Foo {}', "Foo.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: '12.0.0', version: '12.0.0', ngImport: i0, type: Foo, providedIn: 'root' });", ''].join('\n');

function build(modules: Record<string, string>, chunkModuleIds: string[]) {
	const plugin = angularUnlinkedPartialsGuardPlugin();
	const error = vi.fn((message: string) => {
		throw new Error(message);
	});
	(plugin.buildStart as any).call({});
	for (const [id, code] of Object.entries(modules)) (plugin.transform as any).handler.call({}, code, id);
	const bundle = { 'vendor.mjs': { type: 'chunk', moduleIds: chunkModuleIds }, 'app.css': { type: 'asset' } };
	return () => (plugin.generateBundle as any).call({ error }, {}, bundle);
}

describe('angularUnlinkedPartialsGuardPlugin', () => {
	it('runs only in builds, on JavaScript that mentions a partial declaration', () => {
		const plugin = angularUnlinkedPartialsGuardPlugin();
		expect(plugin.apply).toBe('build');
		const { filter } = plugin.transform as any;
		expect(filter.code).toBe('ɵɵngDeclare');
		expect(filter.id.test('/app/node_modules/some-plugin/index.mjs?v=1')).toBe(true);
		expect(filter.id.test('/app/src/app.component.ts')).toBe(false);
	});

	it('fails when a bundled module kept a partial declaration', () => {
		const id = '/app/node_modules/some-plugin/index.mjs';
		expect(build({ [id]: partial }, [id])).toThrow(/some-plugin\/index\.mjs/);
	});

	it('ignores @angular/core, which defines the partial functions, and modules left out of the output', () => {
		const core = '/app/node_modules/@angular/core/fesm2022/core.mjs';
		const unused = '/app/node_modules/some-plugin/unused.mjs';
		expect(build({ [core]: 'function ɵɵngDeclareInjectable(decl) {}', [unused]: partial }, [core])).not.toThrow();
	});
});
