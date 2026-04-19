import { describe, expect, it } from 'vitest';

import { collectAngularTransformCacheInvalidationUrls, collectAngularTransitiveImportersForInvalidation, shouldInvalidateAngularTransitiveImporters } from './websocket.js';

type FakeModule = {
	id: string;
	importers: Set<FakeModule>;
	importedModules?: Set<FakeModule>;
};

function createModule(id: string): FakeModule {
	return {
		id,
		importers: new Set<FakeModule>(),
		importedModules: new Set<FakeModule>(),
	};
}

function addImporter(child: FakeModule, importer: FakeModule): void {
	child.importers.add(importer);
	importer.importedModules?.add(child);
}

describe('collectAngularTransitiveImportersForInvalidation', () => {
	it('walks the importer chain past a lazy boundary so shared-constant edits invalidate the component importer', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const componentModule = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts');
		const routesModule = createModule('/src/app/app.routes.ts');
		const mainModule = createModule('/src/main.ts');

		addImporter(enumModule, componentModule);
		addImporter(componentModule, routesModule);
		addImporter(routesModule, mainModule);

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [enumModule],
		});

		const ids = importers.map((mod) => mod.id).sort();
		expect(ids).toEqual(['/src/app/app.routes.ts', '/src/app/components/onboarding/survey/onboarding-survey-question.component.ts', '/src/main.ts']);
	});

	it('strips query strings when collecting importer ids', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const componentWithQuery = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts?angular');
		const componentCanonical = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts');
		addImporter(enumModule, componentWithQuery);
		addImporter(enumModule, componentCanonical);

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [enumModule],
		});

		const ids = importers.map((mod) => mod.id);
		expect(ids.length).toBe(1);
		expect(ids[0]).toMatch(/onboarding-survey-question\.component\.ts(\?angular)?$/);
	});

	it('excludes node_modules importers to avoid invalidating vendor code', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const appImporter = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts');
		const vendorImporter = createModule('/node_modules/@angular/core/fesm2022/core.mjs');
		addImporter(enumModule, appImporter);
		addImporter(enumModule, vendorImporter);

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [enumModule],
		});

		const ids = importers.map((mod) => mod.id);
		expect(ids).toEqual(['/src/app/components/onboarding/survey/onboarding-survey-question.component.ts']);
	});

	it('excludes Angular test importers by default', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const appImporter = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts');
		const specImporter = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.spec.ts');
		addImporter(enumModule, appImporter);
		addImporter(enumModule, specImporter);

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [enumModule],
		});

		expect(importers.map((mod) => mod.id)).toEqual(['/src/app/components/onboarding/survey/onboarding-survey-question.component.ts']);
	});

	it('tolerates cycles without looping forever', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const a = createModule('/src/app/a.ts');
		const b = createModule('/src/app/b.ts');
		addImporter(enumModule, a);
		addImporter(a, b);
		addImporter(b, a); // cycle

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [enumModule],
		});

		expect(importers.map((m) => m.id).sort()).toEqual(['/src/app/a.ts', '/src/app/b.ts']);
	});

	it('respects the maxDepth bound so a pathological importer graph cannot stall hot-update', () => {
		const root = createModule('/src/app/common/constants/onboarding.enum.ts');
		let prev = root;
		const expected: string[] = [];
		for (let i = 0; i < 50; i++) {
			const next = createModule(`/src/app/chain/mod-${i}.ts`);
			addImporter(prev, next);
			if (i < 3) {
				expected.push(next.id);
			}
			prev = next;
		}

		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [root],
			maxDepth: 3,
		});

		const ids = importers.map((m) => m.id).sort();
		expect(ids).toEqual(expected.sort());
	});

	it('returns an empty list when there are no importers', () => {
		const standalone = createModule('/src/app/standalone.ts');
		const importers = collectAngularTransitiveImportersForInvalidation({
			modules: [standalone],
		});
		expect(importers).toEqual([]);
	});

	it('handles missing modules input gracefully', () => {
		expect(collectAngularTransitiveImportersForInvalidation({ modules: undefined })).toEqual([]);
		expect(collectAngularTransitiveImportersForInvalidation({ modules: null })).toEqual([]);
	});
});

describe('shouldInvalidateAngularTransitiveImporters', () => {
	it('enables invalidation for Angular TypeScript and JavaScript edits', () => {
		for (const ext of ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs']) {
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: `/src/app/common/constants/onboarding.enum.${ext}`,
				}),
			).toBe(true);
		}
	});

	it('enables invalidation for Angular template (.html) edits so owner component transforms are rebuilt', () => {
		expect(
			shouldInvalidateAngularTransitiveImporters({
				flavor: 'angular',
				file: '/src/app/components/login/login.component.html',
			}),
		).toBe(true);
	});

	it('skips invalidation for non-Angular flavors', () => {
		expect(
			shouldInvalidateAngularTransitiveImporters({
				flavor: 'vue',
				file: '/src/App.vue',
			}),
		).toBe(false);
		expect(
			shouldInvalidateAngularTransitiveImporters({
				flavor: 'solid',
				file: '/src/app/App.tsx',
			}),
		).toBe(false);
	});
});

describe('collectAngularTransformCacheInvalidationUrls', () => {
	it('adds extensionless app-module variants for Angular template owner modules and importers', () => {
		const urls = collectAngularTransformCacheInvalidationUrls({
			file: '/src/app/components/login/login.component.html',
			isTs: false,
			hotUpdateRoots: [{ id: '/src/app/components/login/login.component.ts' }],
			transitiveImporters: [{ id: '/src/app/app.routes.ts' }, { id: '/src/main.ts' }],
		}).sort();

		expect(urls).toEqual(['/src/app/app.routes', '/src/app/app.routes.ts', '/src/app/components/login/login.component', '/src/app/components/login/login.component.ts', '/src/main', '/src/main.ts']);
	});

	it('uses the extensionless canonical app path for query-bearing Angular transform variants', () => {
		const urls = collectAngularTransformCacheInvalidationUrls({
			file: '/src/app/components/login/login.component.html',
			isTs: false,
			hotUpdateRoots: [{ id: '/src/app/components/login/login.component.ts?angular' }],
		}).sort();

		expect(urls).toEqual(['/src/app/components/login/login.component', '/src/app/components/login/login.component.ts?angular']);
	});

	it('canonicalizes absolute app paths before deriving extensionless transform invalidations', () => {
		const projectRoot = '/Users/example/heykiddo';
		const urls = collectAngularTransformCacheInvalidationUrls({
			projectRoot,
			file: `${projectRoot}/src/app/components/login/login.component.html`,
			isTs: false,
			hotUpdateRoots: [{ id: `${projectRoot}/src/app/components/login/login.component.ts` }],
			transitiveImporters: [{ id: `${projectRoot}/src/app/app.routes.ts` }, { id: `${projectRoot}/src/main.ts` }],
		}).sort();

		expect(urls).toEqual(['/src/app/app.routes', '/src/app/app.routes.ts', '/src/app/components/login/login.component', '/src/app/components/login/login.component.ts', '/src/main', '/src/main.ts']);
	});
});
