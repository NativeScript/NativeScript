import { describe, expect, it } from 'vitest';

import { angularSourceHasSemanticDecorator, shouldInvalidateAngularTransitiveImporters } from './websocket-angular-hot-update.js';
import { collectTransitiveImportersForInvalidation } from '../../../server/transform-cache-invalidation.js';

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

describe('collectTransitiveImportersForInvalidation', () => {
	it('walks the importer chain past a lazy boundary so shared-constant edits invalidate the component importer', () => {
		const enumModule = createModule('/src/app/common/constants/onboarding.enum.ts');
		const componentModule = createModule('/src/app/components/onboarding/survey/onboarding-survey-question.component.ts');
		const routesModule = createModule('/src/app/app.routes.ts');
		const mainModule = createModule('/src/main.ts');

		addImporter(enumModule, componentModule);
		addImporter(componentModule, routesModule);
		addImporter(routesModule, mainModule);

		const importers = collectTransitiveImportersForInvalidation({
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

		const importers = collectTransitiveImportersForInvalidation({
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

		const importers = collectTransitiveImportersForInvalidation({
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

		const importers = collectTransitiveImportersForInvalidation({
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

		const importers = collectTransitiveImportersForInvalidation({
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

		const importers = collectTransitiveImportersForInvalidation({
			modules: [root],
			maxDepth: 3,
		});

		const ids = importers.map((m) => m.id).sort();
		expect(ids).toEqual(expected.sort());
	});

	it('returns an empty list when there are no importers', () => {
		const standalone = createModule('/src/app/standalone.ts');
		const importers = collectTransitiveImportersForInvalidation({
			modules: [standalone],
		});
		expect(importers).toEqual([]);
	});

	it('handles missing modules input gracefully', () => {
		expect(collectTransitiveImportersForInvalidation({ modules: undefined })).toEqual([]);
		expect(collectTransitiveImportersForInvalidation({ modules: null })).toEqual([]);
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

	// Narrowing: when source is provided, narrow transitive
	// invalidation to files that actually carry Angular semantics.
	// Constants/utility/type-only files become leaf modules — their
	// importers do not need to re-transform because ES module live
	// bindings deliver the new exports automatically once V8
	// re-evaluates the changed module.
	describe('narrows transitive invalidation when source is supplied', () => {
		it('skips transitive invalidation for a constants-only file', () => {
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
