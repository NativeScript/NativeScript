import { describe, expect, it } from 'vitest';

import { appendComponentHmrRegistration, buildComponentHmrRegistrationSuffix, findComponentClassNames, injectComponentHmrRegistration, INJECTION_MARKER } from './inject-component-hmr-registration.js';

describe('findComponentClassNames', () => {
	it('returns an empty array for non-component files', () => {
		const code = `
import { Injectable } from '@angular/core';

@Injectable()
export class FooService {}
`;
		expect(findComponentClassNames(code)).toEqual([]);
	});

	it('finds a single @Component class', () => {
		const code = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-foo',
  templateUrl: './foo.component.html'
})
export class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('handles multi-line decorator arguments with strings, arrays, and templates', () => {
		const code = `
@Component({
  selector: 'app-bar',
  template: \`
    <Label text="Hello, World!" />
    <Label text="@Component(...)" />
  \`,
  styles: [
    'Label { color: red; }',
    'Label.title { font-weight: bold; }'
  ]
})
export class BarComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['BarComponent']);
	});

	it('finds multiple @Component classes in the same file', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}

@Component({ selector: 'app-bar', template: '<Label />' })
export class BarComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent', 'BarComponent']);
	});

	it('skips @Component matches inside line comments', () => {
		const code = `
// @Component({ selector: 'fake' })
// export class NotARealComponent {}
@Component({ selector: 'app-real' })
export class RealComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['RealComponent']);
	});

	it('skips @Component matches inside block comments', () => {
		const code = `
/*
 * Example usage:
 *   @Component({ selector: 'fake' })
 *   class StaleExample {}
 */
@Component({ selector: 'app-real' })
export class RealComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['RealComponent']);
	});

	it('skips @Component matches inside string literals', () => {
		const code = `
const note = "Use @Component({ selector: 'fake' }) on classes.";
const tpl = \`@Component({ selector: 'fake' })\`;
@Component({ selector: 'app-real' })
export class RealComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['RealComponent']);
	});

	it('walks past additional decorators stacked after @Component', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
@SomeOtherDecorator()
@AnotherDecorator({ option: true })
export class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('handles abstract classes', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export abstract class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('handles export default class', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export default class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('handles bare class without export', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('deduplicates class names if a file declares the same name twice', () => {
		// Pathological but possible during refactors: still produce a
		// single entry rather than duplicate registrations.
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
class FooComponent {}

@Component({ selector: 'app-foo-2', template: '<Label />' })
class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual(['FooComponent']);
	});

	it('does not match @Component inside an unrelated decorator name', () => {
		const code = `
@SomeComponent({ selector: 'app-foo' })
class FooComponent {}
`;
		expect(findComponentClassNames(code)).toEqual([]);
	});
});

describe('injectComponentHmrRegistration', () => {
	it('returns null code for files without @Component', () => {
		const code = `
import { Injectable } from '@angular/core';

@Injectable()
export class FooService {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.code).toBeNull();
		expect(result.componentNames).toEqual([]);
	});

	it('appends a registration call for a single @Component class', () => {
		const code = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-foo',
  templateUrl: './foo.component.html'
})
export class FooComponent {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.componentNames).toEqual(['FooComponent']);
		expect(result.code).not.toBeNull();
		expect(result.code).toContain('@nativescript/vite ns-hmr-register');
		expect(result.code).toContain('globalThis.__NS_HMR_REGISTER_COMPONENT__');
		expect(result.code).toContain('"FooComponent"');
		expect(result.code).toContain('FooComponent,');
		expect(result.code).toContain('import.meta.url');
	});

	it('preserves the original module body verbatim and only appends', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.code).not.toBeNull();
		expect(result.code!.startsWith(code)).toBe(true);
	});

	it('appends one registration call per detected component', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}

@Component({ selector: 'app-bar', template: '<Label />' })
export class BarComponent {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.componentNames).toEqual(['FooComponent', 'BarComponent']);
		expect(result.code!.match(/__NS_HMR_REGISTER_COMPONENT__/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
		expect(result.code).toContain('"FooComponent"');
		expect(result.code).toContain('"BarComponent"');
	});

	it('is idempotent — re-running on already-injected code returns null', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}
`;
		const first = injectComponentHmrRegistration(code);
		expect(first.code).not.toBeNull();
		const second = injectComponentHmrRegistration(first.code!);
		expect(second.code).toBeNull();
		expect(second.componentNames).toEqual([]);
	});

	it('respects a custom hookName option', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}
`;
		const result = injectComponentHmrRegistration(code, { hookName: '__TEST_REGISTER__' });
		expect(result.code).toContain('globalThis.__TEST_REGISTER__');
		expect(result.code).not.toContain('globalThis.__NS_HMR_REGISTER_COMPONENT__');
	});

	it('returns null for empty input', () => {
		const result = injectComponentHmrRegistration('');
		expect(result.code).toBeNull();
		expect(result.componentNames).toEqual([]);
	});

	it('skips registration when @Component appears only in comments', () => {
		const code = `
// historical:
//   @Component({ selector: 'app-foo' })
//   class FooComponent {}
export class FooService {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.code).toBeNull();
		expect(result.componentNames).toEqual([]);
	});

	it('typeof guards the class identifier so missing bindings do not throw', () => {
		const code = `
@Component({ selector: 'app-foo', template: '<Label />' })
export class FooComponent {}
`;
		const result = injectComponentHmrRegistration(code);
		expect(result.code).toContain("typeof FooComponent !== 'undefined'");
	});
});

describe('buildComponentHmrRegistrationSuffix', () => {
	it('returns an empty string when no component names are given', () => {
		expect(buildComponentHmrRegistrationSuffix([])).toBe('');
		expect(buildComponentHmrRegistrationSuffix(undefined as any)).toBe('');
	});

	it('produces a registration line per component name', () => {
		const suffix = buildComponentHmrRegistrationSuffix(['FooComponent', 'BarComponent']);
		expect(suffix).toContain(INJECTION_MARKER);
		expect(suffix.match(/__NS_HMR_REGISTER_COMPONENT__/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
		expect(suffix).toContain('"FooComponent"');
		expect(suffix).toContain('"BarComponent"');
	});

	it('respects a custom hookName option', () => {
		const suffix = buildComponentHmrRegistrationSuffix(['FooComponent'], { hookName: '__TEST_HOOK__' });
		expect(suffix).toContain('globalThis.__TEST_HOOK__');
		expect(suffix).not.toContain('globalThis.__NS_HMR_REGISTER_COMPONENT__');
	});

	it('typeof guards every appended registration call', () => {
		const suffix = buildComponentHmrRegistrationSuffix(['FooComponent', 'BarComponent']);
		expect(suffix).toContain("typeof FooComponent !== 'undefined'");
		expect(suffix).toContain("typeof BarComponent !== 'undefined'");
	});
});

describe('appendComponentHmrRegistration', () => {
	const compiledOutput = `
import { Component } from '@angular/core';
class FooComponent {
}
FooComponent.ɵfac = function FooComponent_Factory(t) { return new (t || FooComponent)(); };
FooComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FooComponent, selectors: [["app-foo"]], decls: 1, vars: 0, template: function FooComponent_Template(rf, ctx) { } });
export { FooComponent };
`;

	it('appends a registration call for the provided component names', () => {
		const result = appendComponentHmrRegistration(compiledOutput, ['FooComponent']);
		expect(result.code).not.toBeNull();
		expect(result.componentNames).toEqual(['FooComponent']);
		expect(result.code).toContain(INJECTION_MARKER);
		expect(result.code).toContain('globalThis.__NS_HMR_REGISTER_COMPONENT__');
		expect(result.code).toContain('"FooComponent"');
	});

	it('preserves the compiled module body verbatim and only appends', () => {
		const result = appendComponentHmrRegistration(compiledOutput, ['FooComponent']);
		expect(result.code).not.toBeNull();
		expect(result.code!.startsWith(compiledOutput)).toBe(true);
	});

	it('returns null for empty component name lists', () => {
		const result = appendComponentHmrRegistration(compiledOutput, []);
		expect(result.code).toBeNull();
		expect(result.componentNames).toEqual([]);
	});

	it('returns null when the compiled code is empty', () => {
		const result = appendComponentHmrRegistration('', ['FooComponent']);
		expect(result.code).toBeNull();
		expect(result.componentNames).toEqual([]);
	});

	it('is idempotent — re-running on already-appended code returns null', () => {
		const first = appendComponentHmrRegistration(compiledOutput, ['FooComponent']);
		expect(first.code).not.toBeNull();
		const second = appendComponentHmrRegistration(first.code!, ['FooComponent']);
		expect(second.code).toBeNull();
		expect(second.componentNames).toEqual([]);
	});

	it('appends one registration call per provided component name', () => {
		const result = appendComponentHmrRegistration(compiledOutput, ['FooComponent', 'BarComponent']);
		expect(result.code).not.toBeNull();
		expect(result.code!.match(/__NS_HMR_REGISTER_COMPONENT__/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
		expect(result.code).toContain('"FooComponent"');
		expect(result.code).toContain('"BarComponent"');
	});

	it('respects a custom hookName option', () => {
		const result = appendComponentHmrRegistration(compiledOutput, ['FooComponent'], { hookName: '__TEST_HOOK__' });
		expect(result.code).toContain('globalThis.__TEST_HOOK__');
		expect(result.code).not.toContain('globalThis.__NS_HMR_REGISTER_COMPONENT__');
	});

	it('typeof guards the class identifier so missing bindings do not throw', () => {
		const result = appendComponentHmrRegistration(compiledOutput, ['FooComponent']);
		expect(result.code).toContain("typeof FooComponent !== 'undefined'");
	});
});

describe('exported INJECTION_MARKER', () => {
	it('is a stable string callers can grep for', () => {
		expect(INJECTION_MARKER).toBe('/* @nativescript/vite ns-hmr-register */');
	});
});
