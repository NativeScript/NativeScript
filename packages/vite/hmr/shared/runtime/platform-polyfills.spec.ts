import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generatePlatformPolyfills } from './platform-polyfills.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run the polyfill code in the current global scope via indirect eval */
function evalPolyfills(code: string): void {
	// indirect eval — runs in global scope, not module scope
	const indirectEval = eval;
	indirectEval(code);
}

// ---------------------------------------------------------------------------
// generatePlatformPolyfills — code generation
// ---------------------------------------------------------------------------

describe('generatePlatformPolyfills', () => {
	it('returns a non-empty string', () => {
		const code = generatePlatformPolyfills();
		expect(typeof code).toBe('string');
		expect(code.length).toBeGreaterThan(0);
	});

	it('includes self polyfill', () => {
		const code = generatePlatformPolyfills();
		expect(code).toContain('self');
		expect(code).toContain('globalThis');
	});

	it('includes AbortController polyfill', () => {
		const code = generatePlatformPolyfills();
		expect(code).toContain('AbortController');
	});

	it('includes AbortSignal polyfill', () => {
		const code = generatePlatformPolyfills();
		expect(code).toContain('AbortSignal');
	});

	it('is wrapped in an IIFE for scope isolation', () => {
		const code = generatePlatformPolyfills();
		// Should start with a comment then an IIFE
		expect(code).toMatch(/\(function\s*\(\)\s*\{/);
		expect(code).toContain('})()');
	});

	it('is valid JavaScript (does not throw on eval)', () => {
		const code = generatePlatformPolyfills();
		expect(() => evalPolyfills(code)).not.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Runtime behavior — self polyfill
// ---------------------------------------------------------------------------

describe('self polyfill', () => {
	let originalSelf: any;
	let hadSelf: boolean;

	beforeEach(() => {
		hadSelf = 'self' in globalThis;
		originalSelf = (globalThis as any).self;
	});

	afterEach(() => {
		if (hadSelf) {
			(globalThis as any).self = originalSelf;
		} else {
			delete (globalThis as any).self;
		}
	});

	it('establishes self === globalThis when self is undefined', () => {
		delete (globalThis as any).self;
		evalPolyfills(generatePlatformPolyfills());
		expect((globalThis as any).self).toBe(globalThis);
	});

	it('preserves existing self if already defined', () => {
		const sentinel = { __test: true };
		(globalThis as any).self = sentinel;
		evalPolyfills(generatePlatformPolyfills());
		expect((globalThis as any).self).toBe(sentinel);
	});
});

// ---------------------------------------------------------------------------
// Runtime behavior — AbortController when globals are undefined
// ---------------------------------------------------------------------------

describe('AbortController polyfill — when globals are undefined', () => {
	let originalAC: any;
	let originalAS: any;
	let hadAC: boolean;
	let hadAS: boolean;

	beforeEach(() => {
		hadAC = 'AbortController' in globalThis;
		hadAS = 'AbortSignal' in globalThis;
		originalAC = (globalThis as any).AbortController;
		originalAS = (globalThis as any).AbortSignal;
		delete (globalThis as any).AbortController;
		delete (globalThis as any).AbortSignal;
	});

	afterEach(() => {
		if (hadAC) {
			(globalThis as any).AbortController = originalAC;
		} else {
			delete (globalThis as any).AbortController;
		}
		if (hadAS) {
			(globalThis as any).AbortSignal = originalAS;
		} else {
			delete (globalThis as any).AbortSignal;
		}
	});

	it('establishes a constructible AbortController', () => {
		evalPolyfills(generatePlatformPolyfills());
		const AC = (globalThis as any).AbortController;
		expect(AC).toBeDefined();
		expect(typeof AC).toBe('function');
		const ctrl = new AC();
		expect(ctrl).toBeDefined();
	});

	it('establishes AbortSignal on globalThis', () => {
		evalPolyfills(generatePlatformPolyfills());
		expect((globalThis as any).AbortSignal).toBeDefined();
		expect(typeof (globalThis as any).AbortSignal).toBe('function');
	});

	it('controller.signal.aborted is false initially', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		expect(ctrl.signal).toBeDefined();
		expect(ctrl.signal.aborted).toBe(false);
	});

	it('controller.abort() sets signal.aborted to true', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		ctrl.abort();
		expect(ctrl.signal.aborted).toBe(true);
	});

	it('controller.abort(reason) sets signal.reason', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		const reason = new Error('test reason');
		ctrl.abort(reason);
		expect(ctrl.signal.reason).toBe(reason);
	});

	it('controller.abort() dispatches abort event on signal', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		let fired = false;
		ctrl.signal.addEventListener('abort', () => {
			fired = true;
		});
		ctrl.abort();
		expect(fired).toBe(true);
	});

	it('signal.removeEventListener removes listener', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		let count = 0;
		const handler = () => {
			count++;
		};
		ctrl.signal.addEventListener('abort', handler);
		ctrl.signal.removeEventListener('abort', handler);
		ctrl.abort();
		expect(count).toBe(0);
	});

	it('signal.throwIfAborted() throws when aborted', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		expect(() => ctrl.signal.throwIfAborted()).not.toThrow();
		ctrl.abort();
		expect(() => ctrl.signal.throwIfAborted()).toThrow();
	});

	it('abort() is idempotent — does not fire event twice', () => {
		evalPolyfills(generatePlatformPolyfills());
		const ctrl = new (globalThis as any).AbortController();
		let count = 0;
		ctrl.signal.addEventListener('abort', () => {
			count++;
		});
		ctrl.abort();
		ctrl.abort();
		expect(count).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// Runtime behavior — AbortController when global is broken (non-constructible)
// ---------------------------------------------------------------------------

describe('AbortController polyfill — when global is broken', () => {
	let originalAC: any;
	let originalAS: any;

	beforeEach(() => {
		originalAC = (globalThis as any).AbortController;
		originalAS = (globalThis as any).AbortSignal;
		// Set AbortController to something that exists but is not constructible
		(globalThis as any).AbortController = 42;
		(globalThis as any).AbortSignal = 'broken';
	});

	afterEach(() => {
		(globalThis as any).AbortController = originalAC;
		(globalThis as any).AbortSignal = originalAS;
	});

	it('replaces non-constructible AbortController with working polyfill', () => {
		evalPolyfills(generatePlatformPolyfills());
		const AC = (globalThis as any).AbortController;
		expect(typeof AC).toBe('function');
		const ctrl = new AC();
		expect(ctrl.signal.aborted).toBe(false);
		ctrl.abort();
		expect(ctrl.signal.aborted).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Runtime behavior — AbortController when global already works
// ---------------------------------------------------------------------------

describe('AbortController polyfill — when global already works', () => {
	it('preserves working native AbortController', () => {
		// Node.js has a working AbortController — verify polyfill preserves it
		const NativeAC = (globalThis as any).AbortController;
		if (!NativeAC) {
			// Skip if running in an environment without native AbortController
			return;
		}
		const before = NativeAC;
		evalPolyfills(generatePlatformPolyfills());
		expect((globalThis as any).AbortController).toBe(before);
	});
});
