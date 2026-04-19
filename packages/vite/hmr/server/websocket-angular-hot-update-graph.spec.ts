import { describe, expect, it } from 'vitest';

import { collectGraphUpdateModulesForHotUpdate } from './websocket.js';

function createModule(id: string, options: { importers?: any[]; importedModules?: any[] } = {}) {
	return {
		id,
		importers: new Set(options.importers || []),
		importedModules: new Set(options.importedModules || []),
	};
}

describe('collectGraphUpdateModulesForHotUpdate', () => {
	it('maps Angular template updates to their importer component modules', () => {
		const componentModule = createModule('/src/app/components/login/login.component.ts');
		const templateModule = createModule('/src/app/components/login/login.component.html', {
			importers: [componentModule],
		});

		const targets = collectGraphUpdateModulesForHotUpdate({
			file: '/src/app/components/login/login.component.html',
			flavor: 'angular',
			modules: [templateModule],
			getModuleById: () => undefined,
		});

		expect(targets.map((mod) => mod.id)).toEqual(['/src/app/components/login/login.component.ts']);
	});

	it('falls back to the same-stem component module for Angular template updates when Vite has no importer modules yet', () => {
		const componentModule = createModule('/src/app/components/login/login.component.ts');

		const targets = collectGraphUpdateModulesForHotUpdate({
			file: '/src/app/components/login/login.component.html',
			flavor: 'angular',
			modules: [],
			getModuleById: (id) => (id === '/src/app/components/login/login.component.ts' ? componentModule : undefined),
		});

		expect(targets.map((mod) => mod.id)).toEqual(['/src/app/components/login/login.component.ts']);
	});

	it('keeps direct module updates for TypeScript changes', () => {
		const componentModule = createModule('/src/app/components/login/login.component.ts');

		const targets = collectGraphUpdateModulesForHotUpdate({
			file: '/src/app/components/login/login.component.ts',
			flavor: 'angular',
			modules: [],
			getModuleById: (id) => (id === '/src/app/components/login/login.component.ts' ? componentModule : undefined),
		});

		expect(targets.map((mod) => mod.id)).toEqual(['/src/app/components/login/login.component.ts']);
	});

	it('excludes Angular test modules from hot-update graph targets', () => {
		const componentModule = createModule('/src/app/components/login/login.component.ts');
		const specModule = createModule('/src/app/components/login/login.component.spec.ts');
		const templateModule = createModule('/src/app/components/login/login.component.html', {
			importers: [componentModule, specModule],
		});

		const targets = collectGraphUpdateModulesForHotUpdate({
			file: '/src/app/components/login/login.component.html',
			flavor: 'angular',
			modules: [templateModule],
			getModuleById: () => undefined,
		});

		expect(targets.map((mod) => mod.id)).toEqual(['/src/app/components/login/login.component.ts']);
	});
});
