import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { transformNativeClassSource } from '../helpers/nativeclass-transform.js';
import { postCleanupNativeClass } from '../helpers/nativeclass-transformer-plugin.js';
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

const STATUS_BAR_GETTER_TS = `
@NativeClass()
export class StatusBarController extends UIViewController {
	get preferredStatusBarStyle() {
		const owner = this.owner?.deref();
		if (owner?.statusBarStyle) {
			if (SDK_VERSION >= 13) {
				return owner.statusBarStyle === 'light' ? UIStatusBarStyle.LightContent : UIStatusBarStyle.DarkContent;
			} else {
				return owner.statusBarStyle === 'light' ? UIStatusBarStyle.LightContent : UIStatusBarStyle.Default;
			}
		}
		return UIStatusBarStyle.Default;
	}
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

	it('forces enumerable true for getter descriptors with nested control flow', () => {
		const res = transformNativeClassSource(STATUS_BAR_GETTER_TS, '/app/src/status-bar-controller.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		expect(code).toContain('Object.defineProperty(StatusBarController');
		expect(code).toContain('"preferredStatusBarStyle"');
		expect(code).toMatch(/Object\.defineProperty\([\s\S]*?preferredStatusBarStyle[\s\S]*?enumerable:\s*true/);
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

	it('post-phase: downlevels ES6 class with __decorate([NativeClass()]) to ES5 with __extends', () => {
		// Simulate what Angular's compiler produces after the pre-phase already ran:
		// An ES6 class expression assigned to a var, with __decorate([NativeClass()], X) after it.
		const angularOutput = `
var AppDelegate = class AppDelegate extends UIResponder {
  applicationDidFinishLaunchingWithOptions(application, launchOptions) {
    return true;
  }
  applicationDidBecomeActive(application) {}
};
AppDelegate.ObjCProtocols = [UIApplicationDelegate];
AppDelegate = __decorate([NativeClass()], AppDelegate);
`;
		const result = postCleanupNativeClass(angularOutput, '/app/src/app-delegate.ios.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		// Should NOT contain ES6 class syntax anymore
		expect(code).not.toContain('class AppDelegate extends');
		// Should NOT contain __decorate NativeClass
		expect(code).not.toContain('__decorate');
		expect(code).not.toMatch(/\bNativeClass\b/);
		// Should contain __extends for native class registration
		expect(code).toContain('__extends(AppDelegate');
		// Should still have the ObjCProtocols assignment
		expect(code).toContain('AppDelegate.ObjCProtocols');
		// Should be a function-based ES5 pattern
		expect(code).toContain('function AppDelegate');
	});

	it('post-phase: downlevels ES6 class with alias (e.g. _1 pattern) and __decorate', () => {
		const angularOutputWithAlias = `
var PDFViewDelegateImpl = PDFViewDelegateImpl_1 = class PDFViewDelegateImpl extends NSObject {
  static initWithOwner(owner) { return PDFViewDelegateImpl_1.new(); }
};
PDFViewDelegateImpl.ObjCProtocols = [PDFViewDelegate];
PDFViewDelegateImpl = PDFViewDelegateImpl_1 = __decorate([NativeClass()], PDFViewDelegateImpl);
var PDFViewDelegateImpl_1;
`;
		const result = postCleanupNativeClass(angularOutputWithAlias, '/app/src/pdf-view-delegate.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		// Should NOT contain ES6 class syntax anymore
		expect(code).not.toContain('class PDFViewDelegateImpl extends');
		// Should contain __extends for native class registration
		expect(code).toContain('__extends(PDFViewDelegateImpl');
		// Should preserve the _1 alias assignment
		expect(code).toContain('PDFViewDelegateImpl_1 =');
	});

	it('post-phase: handles __decorate array containing NativeClass + __metadata (constructor case)', () => {
		// Real Angular compile output: when the class has a constructor TS injects
		// `__metadata("design:paramtypes", [])` alongside `NativeClass()`. The original
		// regex-based cleanup required the array to contain ONLY NativeClass() and
		// silently skipped this case, leaving `NativeClass()` in the served code → ReferenceError.
		const angularOutputWithMetadata = `import { __decorate, __metadata } from "tslib";
let MyLocationManagerDelegate = class MyLocationManagerDelegate extends NSObject {
  constructor() { super(); this.callbacks = new Map(); }
  addCallback(key, callback) { this.callbacks.set(key, callback); }
};
MyLocationManagerDelegate.ObjCProtocols = [CLLocationManagerDelegate];
MyLocationManagerDelegate = __decorate([NativeClass(), __metadata("design:paramtypes", [])], MyLocationManagerDelegate);
export { MyLocationManagerDelegate };
`;
		const result = postCleanupNativeClass(angularOutputWithMetadata, '/app/src/my-location-manager.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		// NativeClass must be gone — that was the actual ReferenceError trigger.
		expect(code).not.toMatch(/\bNativeClass\b/);
		// __metadata must survive (some other plugins may rely on the design:paramtypes hint).
		expect(code).toContain('__metadata("design:paramtypes", [])');
		// Should be downleveled to ES5 with __extends for native class detection.
		expect(code).toContain('__extends(MyLocationManagerDelegate');
		expect(code).not.toContain('class MyLocationManagerDelegate extends');
		// __extends must NOT be imported from tslib — the NativeScript iOS V8 runtime
		// installs a native-aware `__extends` on `globalThis` (ClassBuilder.mm
		// `RegisterNativeTypeScriptExtendsFunction`) that performs ObjC class
		// registration when the parent is a native wrapper. Importing tslib's
		// __extends would shadow that global with a plain implementation, leading
		// to `Cannot read properties of undefined (reading '__extended')` at
		// `_super.call(this)` time.
		expect(code).not.toMatch(/import\s*\{[^}]*\b__extends\b[^}]*\}\s*from\s*["'][^"']*tslib[^"']*["']/);
		// The other tslib named imports (used by __decorate / __metadata calls) must remain.
		expect(code).toMatch(/import\s*\{[^}]*\b__decorate\b[^}]*\}\s*from\s*["']tslib["']/);
		expect(code).toMatch(/import\s*\{[^}]*\b__metadata\b[^}]*\}\s*from\s*["']tslib["']/);
	});

	it('post-phase: strips __extends from a pre-existing tslib named import (lets it fall through to global)', () => {
		// Defense in depth: if some upstream plugin already added `__extends` to the
		// tslib import, the post-cleanup must remove it again so the bare reference
		// resolves to the runtime's native-aware global rather than tslib's plain
		// implementation.
		const preImported = `import { __decorate, __extends, __metadata } from "tslib";
let X = class X extends NSObject {};
X.ObjCProtocols = [P];
X = __decorate([NativeClass(), __metadata("design:paramtypes", [])], X);
export { X };
`;
		const result = postCleanupNativeClass(preImported, '/app/src/x.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		// __extends reference is still present (used by the IIFE), but NOT imported.
		expect(code).toContain('__extends(X');
		expect(code).not.toMatch(/import\s*\{[^}]*\b__extends\b[^}]*\}\s*from\s*["'][^"']*tslib[^"']*["']/);
		// __decorate and __metadata stay imported.
		expect(code).toMatch(/import\s*\{[^}]*\b__decorate\b[^}]*\}\s*from\s*["']tslib["']/);
		expect(code).toMatch(/import\s*\{[^}]*\b__metadata\b[^}]*\}\s*from\s*["']tslib["']/);
	});

	it('post-phase: drops the entire tslib import when __extends was the only specifier', () => {
		// Edge case: a pre-existing `import { __extends } from "tslib"` would become
		// `import { } from "tslib"` after stripping — which is a syntax error in some
		// targets. We drop the whole import statement instead.
		const onlyExtendsImport = `import { __extends } from "tslib";
let X = class X extends NSObject {};
X.ObjCProtocols = [P];
X = __decorate([NativeClass()], X);
export { X };
`;
		const result = postCleanupNativeClass(onlyExtendsImport, '/app/src/x.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		expect(code).toContain('__extends(X');
		// No tslib import should remain at all.
		expect(code).not.toMatch(/from\s*["'][^"']*tslib[^"']*["']/);
	});

	it('post-phase: removes the entire __decorate call when NativeClass is the only entry', () => {
		// When the array has only NativeClass (no metadata, no other decorators), the
		// __decorate call should collapse to a self-assign (`X = X`) rather than leaving
		// a stray `__decorate([], X)` that some bundlers will then try to inline.
		const onlyNativeClass = `
var Foo = class Foo extends NSObject {};
Foo.ObjCProtocols = [SomeProto];
Foo = __decorate([NativeClass()], Foo);
`;
		const result = postCleanupNativeClass(onlyNativeClass, '/app/src/foo.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		expect(code).not.toMatch(/\bNativeClass\b/);
		expect(code).not.toContain('__decorate');
		expect(code).toContain('__extends(Foo');
	});

	it('post-phase: keeps remaining decorators when NativeClass is mixed with multiple others', () => {
		// Belt-and-braces: if a user has a custom decorator alongside NativeClass, we
		// must strip ONLY NativeClass and keep the rest intact.
		const mixed = `
var Bar = class Bar extends NSObject {};
Bar = __decorate([CustomDecorator(), NativeClass(), AnotherOne()], Bar);
`;
		const result = postCleanupNativeClass(mixed, '/app/src/bar.ts');
		expect(result).toBeTruthy();
		const code = result!.code;
		expect(code).not.toMatch(/\bNativeClass\b/);
		expect(code).toContain('CustomDecorator()');
		expect(code).toContain('AnotherOne()');
		expect(code).toContain('__extends(Bar');
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
