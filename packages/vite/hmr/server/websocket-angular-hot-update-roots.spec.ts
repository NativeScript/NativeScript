import { describe, expect, it } from 'vitest';

import { collectAngularHotUpdateRoots } from './websocket.js';

type FakeModule = {
	id?: string;
	importers: Set<FakeModule>;
	importedModules: Set<FakeModule>;
};

function createModule(id?: string): FakeModule {
	return {
		id,
		importers: new Set<FakeModule>(),
		importedModules: new Set<FakeModule>(),
	};
}

describe('collectAngularHotUpdateRoots', () => {
	it('collects Angular template owner modules', () => {
		const componentModule = createModule('/src/app/components/login/login.component.ts');
		const templateModule = createModule('/src/app/components/login/login.component.html');
		templateModule.importers.add(componentModule);

		const roots = collectAngularHotUpdateRoots({
			file: '/src/app/components/login/login.component.html',
			modules: [templateModule],
			getModuleById: () => undefined,
		});

		expect(roots.map((mod) => mod.id)).toEqual(['/src/app/components/login/login.component.ts']);
	});

	it('supplements Angular TypeScript roots from moduleGraph file lookups when ctx.modules is empty', () => {
		const fileModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const importVariant = createModule('/src/app/common/constants/onboarding.enum.ts?import');

		const roots = collectAngularHotUpdateRoots({
			file: '/src/app/common/constants/onboarding.enum.ts',
			modules: [],
			getModuleById: () => undefined,
			getModulesByFile: () => [fileModule, importVariant],
		});

		expect(roots.map((mod) => mod.id)).toEqual(['/src/app/common/constants/onboarding.enum.ts', '/src/app/common/constants/onboarding.enum.ts?import']);
	});

	it('falls back to the direct moduleGraph id when file lookups are unavailable', () => {
		const directModule = createModule('/src/app/common/constants/onboarding.enum.ts');

		const roots = collectAngularHotUpdateRoots({
			file: '/src/app/common/constants/onboarding.enum.ts',
			modules: undefined,
			getModuleById: (id) => (id === '/src/app/common/constants/onboarding.enum.ts' ? directModule : undefined),
		});

		expect(roots.map((mod) => mod.id)).toEqual(['/src/app/common/constants/onboarding.enum.ts']);
	});
});
