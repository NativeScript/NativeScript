import { describe, expect, it } from 'vitest';

import { angularSourceHasSemanticDecorator, collectAngularEvictionUrls, collectAngularTransformCacheInvalidationUrls, collectAngularTransitiveImportersForInvalidation, shouldInvalidateAngularTransitiveImporters } from './websocket.js';

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
	it('enables invalidation for Angular TypeScript and JavaScript edits when source is not provided (preserve pre-round-six behavior)', () => {
		for (const ext of ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs']) {
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: `/src/app/common/constants/onboarding.enum.${ext}`,
				}),
			).toBe(true);
		}
	});

	it('skips invalidation for Angular template-only (.html/.htm) edits', () => {
		for (const file of ['/src/app/components/login/login.component.html', '/src/app/components/login/login.component.htm']) {
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file,
				}),
			).toBe(false);
		}
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

	// Round-six narrowing: when source is provided, narrow transitive
	// invalidation to files that actually carry Angular semantics.
	// Constants/utility/type-only files become leaf modules — their
	// importers do not need to re-transform because ES module live
	// bindings deliver the new exports automatically once V8 re-evaluates
	// the changed module. See HMR_CORE_REALM_DETERMINISTIC_PLAN.md
	// (round-six) for the regression analysis.
	describe('round-six: narrows transitive invalidation when source is supplied', () => {
		it('skips transitive invalidation for a constants-only file (the heykiddo case)', () => {
			const constantsSource = `
				export const BAR_HEIGHT = 50;
				export const ICON_SIZE = 24;
				export const COLORS = { primary: '#fff', secondary: '#000' } as const;
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/common/constants/app-resources.constants.ts',
					source: constantsSource,
				}),
			).toBe(false);
		});

		it('skips transitive invalidation for a plain enum file', () => {
			const enumSource = `
				export enum OnboardingStep {
					Welcome = 'welcome',
					ChildName = 'child-name',
					Done = 'done',
				}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/common/constants/onboarding.enum.ts',
					source: enumSource,
				}),
			).toBe(false);
		});

		it('skips transitive invalidation for a pure utility/types file', () => {
			const utilsSource = `
				export interface UserProfile {
					id: string;
					name: string;
				}
				export function formatName(profile: UserProfile): string {
					return profile.name.trim();
				}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/utils/format.ts',
					source: utilsSource,
				}),
			).toBe(false);
		});

		it('keeps transitive invalidation for a @Component file', () => {
			const componentSource = `
				import { Component } from '@angular/core';
				@Component({
					selector: 'app-login',
					templateUrl: './login.component.html',
				})
				export class LoginComponent {}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/components/login/login.component.ts',
					source: componentSource,
				}),
			).toBe(true);
		});

		it('keeps transitive invalidation for a @Directive file', () => {
			const directiveSource = `
				import { Directive, HostListener } from '@angular/core';
				@Directive({ selector: '[appAutofocus]' })
				export class AutofocusDirective {}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/directives/autofocus.directive.ts',
					source: directiveSource,
				}),
			).toBe(true);
		});

		it('keeps transitive invalidation for a @Pipe file', () => {
			const pipeSource = `
				import { Pipe, PipeTransform } from '@angular/core';
				@Pipe({ name: 'capitalize', standalone: true })
				export class CapitalizePipe implements PipeTransform {
					transform(value: string): string { return value.toUpperCase(); }
				}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/pipes/capitalize.pipe.ts',
					source: pipeSource,
				}),
			).toBe(true);
		});

		it('keeps transitive invalidation for an @Injectable service', () => {
			const serviceSource = `
				import { Injectable } from '@angular/core';
				@Injectable({ providedIn: 'root' })
				export class SessionService {
					getToken(): string | null { return null; }
				}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/services/session.service.ts',
					source: serviceSource,
				}),
			).toBe(true);
		});

		it('keeps transitive invalidation for an @NgModule file', () => {
			const moduleSource = `
				import { NgModule } from '@angular/core';
				@NgModule({
					imports: [],
					declarations: [],
				})
				export class SharedModule {}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/shared.module.ts',
					source: moduleSource,
				}),
			).toBe(true);
		});

		it('does not match the word "Component" inside a string literal', () => {
			const constantsSource = `
				export const ERROR_MESSAGES = {
					missing: 'Missing required @Component decorator on the class.',
					stale: '"@Component" should be moved to a separate file.',
				};
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/constants/messages.ts',
					source: constantsSource,
				}),
			).toBe(false);
		});

		it('does not match a JSDoc reference to @Component', () => {
			const utilSource = `
				/**
				 * Helper that emits the same shape an @Component decorator expects.
				 * @param ref the {@link ElementRef} being targeted.
				 */
				export function buildComponentMeta() {
					return { selector: 'noop' };
				}
			`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/shared/utils/component-meta.ts',
					source: utilSource,
				}),
			).toBe(false);
		});

		it('matches an @Injectable that is not preceded by a leading import block', () => {
			const serviceSource = `@Injectable({ providedIn: 'root' })\nexport class A {}\n`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/a.ts',
					source: serviceSource,
				}),
			).toBe(true);
		});

		it('matches a decorator with leading tabs/spaces (real-world Angular indentation)', () => {
			const componentSource = `import { Component } from '@angular/core';\n\n\t@Component({ selector: 'app-x' })\nexport class X {}\n`;
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/x.component.ts',
					source: componentSource,
				}),
			).toBe(true);
		});

		it('falls back to the conservative behavior when source is empty (read failure)', () => {
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/some.ts',
					source: '',
				}),
			).toBe(false);
		});

		it('falls back to the conservative behavior when source is undefined', () => {
			// `source: undefined` keeps the pre-round-six behavior so a
			// `ctx.read()` failure does not silently disable invalidation.
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/some.ts',
					source: undefined,
				}),
			).toBe(true);
		});

		it('falls back to the conservative behavior when source is null', () => {
			expect(
				shouldInvalidateAngularTransitiveImporters({
					flavor: 'angular',
					file: '/src/app/some.ts',
					source: null,
				}),
			).toBe(true);
		});
	});
});

describe('angularSourceHasSemanticDecorator', () => {
	it('returns false for empty/null/undefined input', () => {
		expect(angularSourceHasSemanticDecorator('')).toBe(false);
		expect(angularSourceHasSemanticDecorator(null as unknown as string)).toBe(false);
		expect(angularSourceHasSemanticDecorator(undefined as unknown as string)).toBe(false);
	});

	it('matches decorators at start of line with no indentation', () => {
		expect(angularSourceHasSemanticDecorator('@Component({})')).toBe(true);
		expect(angularSourceHasSemanticDecorator('@Directive({})')).toBe(true);
		expect(angularSourceHasSemanticDecorator('@Pipe({})')).toBe(true);
		expect(angularSourceHasSemanticDecorator('@Injectable()')).toBe(true);
		expect(angularSourceHasSemanticDecorator('@NgModule({})')).toBe(true);
	});

	it('matches decorators with leading whitespace', () => {
		expect(angularSourceHasSemanticDecorator('  @Component({})')).toBe(true);
		expect(angularSourceHasSemanticDecorator('\t@Directive({})')).toBe(true);
	});

	it('does not match @Input/@Output/@HostBinding (these never appear without an enclosing @Component anyway)', () => {
		// Leaf-property decorators alone don't justify transitive invalidation.
		// Real Angular code that uses them is inside a @Component class — and
		// the @Component decorator on the class will trip the matcher first.
		const onlyInputs = `
			@Input() name = '';
			@Output() change = new EventEmitter();
		`;
		expect(angularSourceHasSemanticDecorator(onlyInputs)).toBe(false);
	});

	it('does not match prototype-style decorator patterns inside string literals', () => {
		const code = `export const TEMPLATE = "  @Component({ selector: 'x' })";`;
		expect(angularSourceHasSemanticDecorator(code)).toBe(false);
	});

	it('does not match member access patterns like obj.@Component', () => {
		// This is technically not valid TypeScript, but the regex would have
		// to be looser to accept it; pinning the negative case keeps the
		// matcher honest.
		const code = 'const x = obj.@Component;';
		expect(angularSourceHasSemanticDecorator(code)).toBe(false);
	});

	it('matches when the decorator argument list spans multiple lines', () => {
		const code = `
			@Component(
				{
					selector: 'app-x',
				},
			)
			export class X {}
		`;
		expect(angularSourceHasSemanticDecorator(code)).toBe(true);
	});

	it('rejects identifier prefix shadowing (e.g. @ComponentOf)', () => {
		const code = '@ComponentOf({ name: "x" })';
		expect(angularSourceHasSemanticDecorator(code)).toBe(false);
	});

	it('does not match when only "Component" appears in a comment', () => {
		const code = '// @Component is required for this class to work';
		expect(angularSourceHasSemanticDecorator(code)).toBe(false);
	});

	it('matches one decorator out of a multi-decorator stack', () => {
		const code = `
			@SomeOtherDecorator()
			@Component({ selector: 'x' })
			@AnotherDecorator()
			export class X {}
		`;
		expect(angularSourceHasSemanticDecorator(code)).toBe(true);
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

// alpha.59.1 — runtime eviction set must include transitive importers even
// when the Vite-side narrowing optimization decides their compiled JS is
// unchanged. ESM live bindings only refresh if the importing module
// re-evaluates inside V8 against a freshly fetched copy of the changed
// module; if the importer stays cached in `g_moduleRegistry`, it continues
// to read the OLD exports and the user never sees the change.
//
// Regression scenario (heykiddo):
//   1. Edit `app-resources.constants.ts` (no @Component decorator).
//   2. Server-side narrowing skips Vite re-transform of importers.
//   3. PRE-FIX: `transitiveImporters` was passed empty to
//      `collectAngularEvictionUrls` → eviction set = [file, main.ts] only.
//      Components stay cached with OLD bindings → no visual update even
//      though logs show `refresh=257ms` and `Application.resetRootView`
//      ran cleanly.
//   4. POST-FIX: callers always compute the transitive closure for
//      eviction; only Vite-graph invalidation is gated on narrowing.
describe('collectAngularEvictionUrls (alpha.59 + alpha.59.1 invariants)', () => {
	const origin = 'http://localhost:5173';
	const projectRoot = '/Users/example/heykiddo';

	it('always includes the changed file as an eviction URL (both extensioned and extensionless)', () => {
		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/common/constants/app-resources.constants.ts`,
			projectRoot,
			origin,
		});

		expect(urls).toContain(`${origin}/ns/m/src/app/common/constants/app-resources.constants.ts`);
		// alpha.61 — extensionless form is the canonical V8 cache key
		expect(urls).toContain(`${origin}/ns/m/src/app/common/constants/app-resources.constants`);
	});

	it('always includes the bootstrap entry so `import(main.ts)` re-evaluates after eviction', () => {
		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/common/constants/app-resources.constants.ts`,
			projectRoot,
			origin,
			bootstrapEntry: '/src/main.ts',
		});

		expect(urls).toContain(`${origin}/ns/m/src/main.ts`);
		// Defense-in-depth: also emit `/src/main` (extensionless) in case
		// some pathway imports main.ts via Vite's resolve.extensions.
		expect(urls).toContain(`${origin}/ns/m/src/main`);
	});

	it('includes transitive importers even for narrowed (constants/leaf) edits — regression guard for alpha.59.1', () => {
		// Models the heykiddo case: a constants file with no decorator,
		// imported by a component, which is imported by routes, which is
		// imported by main.ts. All three importers must end up in the
		// eviction set so V8 re-fetches them and re-binds against the
		// freshly evaluated constants module.
		const transitiveImporters = [{ id: `${projectRoot}/src/app/components/login/login.component.ts` }, { id: `${projectRoot}/src/app/app.routes.ts` }, { id: `${projectRoot}/src/main.ts` }];

		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/common/constants/app-resources.constants.ts`,
			projectRoot,
			origin,
			transitiveImporters,
			bootstrapEntry: '/src/main.ts',
		}).sort();

		expect(urls).toEqual(
			[
				// alpha.61: every TS/JS app module emits BOTH the
				// extensioned form (covers explicit `.ts` imports like
				// the HMR client's `import(main.ts)`) and the
				// extensionless form (covers Vite's default extension
				// stripping, which is how V8 actually keys
				// `g_moduleRegistry`).
				`${origin}/ns/m/src/app/app.routes`,
				`${origin}/ns/m/src/app/app.routes.ts`,
				`${origin}/ns/m/src/app/common/constants/app-resources.constants`,
				`${origin}/ns/m/src/app/common/constants/app-resources.constants.ts`,
				`${origin}/ns/m/src/app/components/login/login.component`,
				`${origin}/ns/m/src/app/components/login/login.component.ts`,
				`${origin}/ns/m/src/main`,
				`${origin}/ns/m/src/main.ts`,
			].sort(),
		);
	});

	it('emits canonical /ns/m URLs (no __ns_hmr__/<tag>/ prefix and no version segments)', () => {
		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/foo.ts`,
			projectRoot,
			origin,
			bootstrapEntry: '/src/main.ts',
		});

		for (const url of urls) {
			expect(url).toMatch(/^http:\/\/localhost:5173\/ns\/m\//);
			expect(url).not.toMatch(/__ns_hmr__/);
			expect(url).not.toMatch(/__ns_boot__/);
			expect(url).not.toMatch(/\/v\d+\//);
		}
	});

	it('excludes node_modules importers (vendor packages stay hot in the V8 cache)', () => {
		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/common/constants/app-resources.constants.ts`,
			projectRoot,
			origin,
			transitiveImporters: [
				{ id: `${projectRoot}/src/app/components/login/login.component.ts` },
				// Even though `collectAngularTransitiveImportersForInvalidation`
				// already filters node_modules, eviction must defend in depth
				// in case an upstream caller passes a raw module set.
				{ id: '/node_modules/@angular/core/fesm2022/core.mjs' },
			],
			bootstrapEntry: '/src/main.ts',
		});

		const nodeModuleUrls = urls.filter((url) => url.includes('/node_modules/'));
		expect(nodeModuleUrls).toEqual([]);
	});

	it('deduplicates when the same module appears in multiple input lists', () => {
		// Models: change occurs in `main.ts` itself. The file IS the
		// hotUpdateRoot AND the bootstrapEntry AND a transitiveImporter
		// of itself (main.ts being its own root).
		const mainAbs = `${projectRoot}/src/main.ts`;
		const urls = collectAngularEvictionUrls({
			file: mainAbs,
			projectRoot,
			origin,
			hotUpdateRoots: [{ id: mainAbs }],
			transitiveImporters: [{ id: mainAbs }],
			bootstrapEntry: '/src/main.ts',
		});

		const mainUrl = `${origin}/ns/m/src/main.ts`;
		expect(urls.filter((url) => url === mainUrl).length).toBe(1);
	});

	it('strips query strings on importer ids before generating eviction URLs', () => {
		const urls = collectAngularEvictionUrls({
			file: `${projectRoot}/src/app/common/constants/app-resources.constants.ts`,
			projectRoot,
			origin,
			transitiveImporters: [{ id: `${projectRoot}/src/app/components/login/login.component.ts?angular` }, { id: `${projectRoot}/src/app/components/login/login.component.ts` }],
		});

		const componentUrls = urls.filter((url) => url.includes('login.component')).sort();
		// Expect both extensioned and extensionless canonical forms;
		// query string is stripped before normalization so the two raw
		// inputs collapse to a single canonical relative path.
		expect(componentUrls).toEqual([`${origin}/ns/m/src/app/components/login/login.component`, `${origin}/ns/m/src/app/components/login/login.component.ts`]);
	});

	// alpha.61 — direct regression test for the silent-HMR bug.
	//
	// Live-fire scenario from the heykiddo runtime logs:
	//   `[resolver][http-rel] base=.../main.ts spec=/ns/m/src/app/app.component
	//    -> http://localhost:5173/ns/m/src/app/app.component`
	//   `[http-esm][load][cache-hit] key=http://localhost:5173/ns/m/src/app/app.component`
	// V8 stores app modules under EXTENSIONLESS URLs because Vite strips
	// extensions in generated import statements. Pre-alpha.61, the server
	// only emitted the `.ts` form, so every eviction was a `remove:miss`
	// against the registry and stale modules survived. This test pins
	// the dual-form invariant so a future refactor cannot accidentally
	// drop the extensionless URL again.
	describe('alpha.61: emits canonical extensionless URLs (matching V8 cache keys)', () => {
		it('emits BOTH `.ts` and extensionless form for app TS modules', () => {
			const urls = collectAngularEvictionUrls({
				file: `${projectRoot}/src/app/foo.component.ts`,
				projectRoot,
				origin,
			});

			expect(urls).toContain(`${origin}/ns/m/src/app/foo.component.ts`);
			expect(urls).toContain(`${origin}/ns/m/src/app/foo.component`);
		});

		it('emits dual forms for every JS/TS extension Vite strips (.ts/.tsx/.js/.jsx/.mjs/.mts/.cjs/.cts)', () => {
			for (const ext of ['ts', 'tsx', 'js', 'jsx', 'mjs', 'mts', 'cjs', 'cts']) {
				const urls = collectAngularEvictionUrls({
					file: `${projectRoot}/src/app/foo.${ext}`,
					projectRoot,
					origin,
				});

				expect(urls).toContain(`${origin}/ns/m/src/app/foo.${ext}`);
				expect(urls).toContain(`${origin}/ns/m/src/app/foo`);
			}
		});

		it('emits dual forms for index.ts barrel files (the heykiddo `utils/index` case)', () => {
			// V8 stores barrel files under `/index` (Vite's canonical
			// path) — the extensioned form is rarely cached, but emit
			// it anyway as defense-in-depth.
			const urls = collectAngularEvictionUrls({
				file: `${projectRoot}/src/app/shared/utils/index.ts`,
				projectRoot,
				origin,
			});

			expect(urls).toContain(`${origin}/ns/m/src/app/shared/utils/index.ts`);
			expect(urls).toContain(`${origin}/ns/m/src/app/shared/utils/index`);
		});

		it('does NOT strip non-JS/TS extensions (e.g. .html / .css / .json / .scss must stay intact)', () => {
			// Templates and stylesheets are not registered as ES modules;
			// the runtime would not have a `*.html` key without the
			// `.html` suffix, so emitting an extensionless variant would
			// (a) waste invalidate-state cycles and (b) collide with a
			// real TS module of the same basename in some edge cases.
			for (const ext of ['html', 'htm', 'css', 'scss', 'less', 'json', 'svg']) {
				const urls = collectAngularEvictionUrls({
					file: `${projectRoot}/src/app/foo.${ext}`,
					projectRoot,
					origin,
				});

				expect(urls).toContain(`${origin}/ns/m/src/app/foo.${ext}`);
				expect(urls).not.toContain(`${origin}/ns/m/src/app/foo`);
			}
		});

		it('still deduplicates when the same module appears twice (extensioned + extensionless dedupe set-collapse)', () => {
			// Even though we emit two URLs per file, the underlying
			// `Set` should still collapse repeated inputs (e.g. when a
			// module is both a `hotUpdateRoot` and a `transitiveImporter`).
			const fooAbs = `${projectRoot}/src/app/foo.component.ts`;
			const urls = collectAngularEvictionUrls({
				file: fooAbs,
				projectRoot,
				origin,
				hotUpdateRoots: [{ id: fooAbs }],
				transitiveImporters: [{ id: fooAbs }],
			});

			expect(urls.filter((url) => url === `${origin}/ns/m/src/app/foo.component.ts`).length).toBe(1);
			expect(urls.filter((url) => url === `${origin}/ns/m/src/app/foo.component`).length).toBe(1);
		});
	});
});
