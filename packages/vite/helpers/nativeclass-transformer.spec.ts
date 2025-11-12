import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { transformNativeClassSource } from '../helpers/nativeclass-transform.js';
import nativeClassTransformer from '../transformers/NativeClass/index.js';

const SAMPLE_TS = `

@NativeClass()
export class TimerTargetImpl extends NSObject {
  static initWithCallback(callback: Function, id: number, shouldRepeat: boolean) {
    return new TimerTargetImpl();
  }
  tick(timer: any) {}
}
`;

// Stacked decorators with NativeClass having multi-line args
const STACKED_TS = `
@Other()
@NativeClass({
	some: 'value',
	nested: () => true
})
export class StackedImpl extends NSObject { }
`;

// Marker-only scenario simulating prior textual strip (/*__NativeClass__*/) before class
const MARKER_ONLY_TS = `
/*__NativeClass__*/
export class MarkerImpl extends NSObject { static x() { return 42 } }
`;

// Hyphenated property name to ensure defineProperty's key stays quoted and enumerable is true
const HYPHEN_PROP_TS = `
@NativeClass()
export class HyphenImpl extends NSObject {
	['frame-in']() { return 'ok' }
}
`;

// Nested class inside a function with @NativeClass
const NESTED_CLASS_TS = `
function ensureTouchControlHandlers() {
	@NativeClass
	class TouchHandlerImpl extends NSObject {
		static initWithOwner(owner: any) { return TouchHandlerImpl.new(); }
	}
	return TouchHandlerImpl;
}
`;

const NO_DECORATOR_TS = `
export class Foo { bar() {} }
`;

describe('NativeClass transformer helper', () => {
	it('removes @NativeClass and emits ES5 for decorated classes', () => {
		const res = transformNativeClassSource(SAMPLE_TS, '/app/src/sample.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		// Should not contain the decorator marker anymore
		expect(code).not.toContain('@NativeClass');
		expect(code).not.toContain('NativeClass');
		// Should compile class to ES5 pattern (function IIFE or defineProperty)
		expect(/Object\.defineProperty\(|function\s*\(/.test(code)).toBeTruthy();
	});

	it('handles stacked decorators + multi-line @NativeClass args', () => {
		const res = transformNativeClassSource(STACKED_TS, '/app/src/stacked.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		expect(code).not.toContain('@NativeClass');
		expect(code).not.toContain('/*__NativeClass__*/');
		expect(/StackedImpl/.test(code)).toBeTruthy();
		// Confirm downlevel (presence of function wrapper or defineProperty)
		expect(/Object\.defineProperty\(|function\s*\(/.test(code)).toBeTruthy();
	});

	it('transforms marker-only class when decorator already stripped', () => {
		const res = transformNativeClassSource(MARKER_ONLY_TS, '/app/src/marker.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		expect(code).not.toContain('/*__NativeClass__*/');
		expect(/MarkerImpl/.test(code)).toBeTruthy();
		// Confirm ES5 downlevel
		expect(/Object\.defineProperty\(|function\s*\(/.test(code)).toBeTruthy();
	});

	it("doesn't corrupt quoted hyphenated property keys and sets enumerable true", () => {
		const res = transformNativeClassSource(HYPHEN_PROP_TS, '/app/src/hyphen.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		// Key must remain quoted, not a regex literal
		expect(code).toContain("'frame-in'");
		expect(code).not.toContain('/frame-in');
		// enumerable should be set to true on the descriptor, or we emit a direct prototype assignment which is enumerable by default
		expect(/Object\.defineProperty\([\s\S]*?{[\s\S]*?enumerable:\s*true/.test(code) || /prototype\['frame-in'\]\s*=/.test(code)).toBeTruthy();
	});

	it('handles @NativeClass on nested class declarations', () => {
		const res = transformNativeClassSource(NESTED_CLASS_TS, '/app/src/nested.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		expect(code).not.toContain('@NativeClass');
		expect(code).not.toContain('/*__NativeClass__*/');
		// Should convert nested class to ES5 or __extends pattern without __decorate
		expect(code).toMatch(/function\s*TouchHandlerImpl\s*\(|__extends\(|Object\.defineProperty/);
		// No __decorate in the transformed output
		expect(code).not.toMatch(/__decorate/);
	});

	it('does not change code without @NativeClass', () => {
		const result = ts.transpileModule(NO_DECORATOR_TS, {
			fileName: '/app/src/none.ts',
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ESNext,
			},
			transformers: { before: [nativeClassTransformer as unknown as ts.TransformerFactory<ts.SourceFile>] },
		});
		expect(result.outputText).toContain('class Foo');
	});

	it('returns null for sources without @NativeClass', () => {
		const res = transformNativeClassSource(NO_DECORATOR_TS, '/app/src/none.ts');
		expect(res).toBeNull();
	});

	it('handles Android-style constructor returning global.__native(this) without leaking top-level return', () => {
		const ANDROID_CONSTRUCTOR_TS = `
@NativeClass
export class FooImpl extends NSObject {
	constructor() {
		super();
		return global.__native(this);
	}
}
`;
		// Use a non-platform-specific filename in unit tests so the helper doesn't skip due to CLI flags
		const res = transformNativeClassSource(ANDROID_CONSTRUCTOR_TS, '/app/src/page-transition.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		// No decorator remnants
		expect(code).not.toContain('@NativeClass');
		expect(code).not.toContain('/*__NativeClass__*/');
		// Should be downleveled to ES5 constructs
		expect(/Object\.defineProperty\(|function\s*\(/.test(code)).toBeTruthy();
		// Parse and ensure there is no top-level return statement
		const sf = ts.createSourceFile('/check.js', code, ts.ScriptTarget.ES2017, true, ts.ScriptKind.JS);
		const hasTopLevelReturn = sf.statements.some((s) => s.kind === ts.SyntaxKind.ReturnStatement);
		expect(hasTopLevelReturn).toBe(false);
	});
});
