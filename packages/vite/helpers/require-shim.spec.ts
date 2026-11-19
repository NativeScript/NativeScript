import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { createRequireShimCode } from './require-shim.js';

type ShimRequire = ((id: string) => any) & { context: () => { keys: () => string[] } };

function installShim(opts: { hmrActive: boolean; onDisk?: Record<string, unknown>; coreModules?: Record<string, unknown>; noRuntimeRequire?: boolean }) {
	const runtimeErrors: Record<string, Error> = {};
	const context = vm.createContext({});
	if (!opts.noRuntimeRequire) {
		context.require = (id: string) => {
			if (opts.onDisk && id in opts.onDisk) return opts.onDisk[id];
			throw (runtimeErrors[id] = new Error(`Could not find module '${id}'`));
		};
	}
	if (opts.coreModules) {
		context.__coreModules = opts.coreModules;
		vm.runInContext("globalThis[Symbol.for('nativescript.dev')] = { coreModules: globalThis.__coreModules };", context);
	}
	vm.runInContext(createRequireShimCode({ hmrActive: opts.hmrActive }), context);
	return { req: context.require as ShimRequire, runtimeErrors };
}

function thrownBy(fn: () => unknown): any {
	try {
		fn();
	} catch (e) {
		return e;
	}
	throw new Error('expected a throw');
}

function nullProtoNamespace(fields: Record<string, unknown>) {
	return Object.assign(Object.create(null), fields);
}

describe('bundle.mjs require shim under HMR', () => {
	it('stubs Node builtins, with or without the node: prefix', () => {
		const { req } = installShim({ hmrActive: true });

		expect(req('fs')).toEqual({});
		expect(req('node:path')).toEqual({});
		expect(req('tty')).toEqual({});
		expect(req('node:worker_threads')).toEqual({});
	});

	it('asks the runtime first for Node builtins outside the stub table', () => {
		const processPolyfill = { env: {} };
		const { req } = installShim({ hmrActive: true, onDisk: { process: processPolyfill } });

		expect(req('process')).toBe(processPolyfill);
		expect(req('string_decoder')).toEqual({});
	});

	it('stubs require.context', () => {
		const { req } = installShim({ hmrActive: true });

		expect(req.context().keys()).toEqual([]);
	});

	it('hands ns: and node: specifiers to the runtime first', () => {
		const devHost = { createRequire() {} };
		const url = { URL: class {} };
		const { req } = installShim({ hmrActive: true, onDisk: { 'ns:module': devHost, 'node:url': url } });

		expect(req('ns:module')).toBe(devHost);
		expect(req('node:url')).toBe(url);
	});

	it("rethrows the runtime's error for an ns: miss", () => {
		const { req, runtimeErrors } = installShim({ hmrActive: true });

		expect(thrownBy(() => req('ns:missing'))).toBe(runtimeErrors['ns:missing']);
	});

	it('answers @nativescript/core from the served coreModules, shaped for CommonJS', () => {
		const View = class {};
		const { req } = installShim({ hmrActive: true, coreModules: { '@nativescript/core/ui/core/view': nullProtoNamespace({ View }) } });

		const viaExact = req('@nativescript/core/ui/core/view');
		expect(viaExact.View).toBe(View);
		expect(typeof viaExact.hasOwnProperty).toBe('function');
		expect(req('@nativescript/core/ui/core/view/index.js')).toBe(viaExact);
	});

	it('falls back to the runtime for a core module the served app has not evaluated', () => {
		const onDisk = { Application: {} };
		const { req } = installShim({ hmrActive: true, coreModules: {}, onDisk: { '@nativescript/core/application': onDisk } });

		expect(req('@nativescript/core/application')).toBe(onDisk);
	});

	it('throws a core-specific error when neither coreModules nor the runtime has the core module', () => {
		const { req, runtimeErrors } = installShim({ hmrActive: true, coreModules: {} });

		const error = thrownBy(() => req('@nativescript/core/ui/gestures'));

		expect(error.message).toBe("[ns-entry] require('@nativescript/core/ui/gestures') can't be resolved in a dev session: the served app hasn't evaluated that @nativescript/core module yet. Import '@nativescript/core/ui/gestures' as ESM (e.g. in the app entry) so it evaluates before it is required. Runtime error: Could not find module '@nativescript/core/ui/gestures'");
		expect(error.message).not.toContain('optimizeDeps');
		expect(error.cause).toBe(runtimeErrors['@nativescript/core/ui/gestures']);
	});

	it('returns a package the runtime finds on disk, shaped for CommonJS', () => {
		const pkg = { answer: 42 };
		const namespace = nullProtoNamespace({ value: 1 });
		const { req } = installShim({ hmrActive: true, onDisk: { 'some-pkg': pkg, 'esm-pkg': namespace } });

		expect(req('some-pkg')).toBe(pkg);
		expect(req('esm-pkg')).toEqual({ value: 1 });
		expect(Object.getPrototypeOf(req('esm-pkg'))).not.toBeNull();
	});

	it('throws with the optimizeDeps.include hint when a package resolves nowhere', () => {
		const { req, runtimeErrors } = installShim({ hmrActive: true });

		const error = thrownBy(() => req('@scope/cjs-dep'));

		expect(error.message).toBe("[ns-entry] require('@scope/cjs-dep') can't be resolved in a dev session: require() resolves on disk only. Add '@scope/cjs-dep', or the CommonJS package that requires it, to optimizeDeps.include, or import it as ESM. Runtime error: Could not find module '@scope/cjs-dep'");
		expect(error.cause).toBe(runtimeErrors['@scope/cjs-dep']);
	});

	it('leaves out the optimizeDeps hint for path specifiers', () => {
		const { req } = installShim({ hmrActive: true });

		for (const id of ['./local', '/abs/file.js', '~/app/page', 'file:///app/x.js']) {
			const error = thrownBy(() => req(id));
			expect(error.message).toContain(`require('${id}') can't be resolved in a dev session: require() resolves on disk only.`);
			expect(error.message).not.toContain('optimizeDeps');
		}
	});

	it('throws without a cause when the runtime has no require', () => {
		const { req } = installShim({ hmrActive: true, noRuntimeRequire: true });

		const error = thrownBy(() => req('some-pkg'));

		expect(error.message).toContain("require('some-pkg') can't be resolved in a dev session");
		expect(error.message).not.toContain('Runtime error');
		expect(error.cause).toBeUndefined();
	});
});

describe('bundle.mjs require shim in bundled builds', () => {
	it('returns {} on a miss', () => {
		const { req } = installShim({ hmrActive: false });

		expect(req('some-pkg')).toEqual({});
		expect(req('ns:missing')).toEqual({});
		expect(req('@nativescript/core/ui/gestures')).toEqual({});
	});

	it('stubs the builtin table and hands packages to the runtime', () => {
		const pkg = { answer: 42 };
		const { req } = installShim({ hmrActive: false, onDisk: { 'some-pkg': pkg } });

		expect(req('fs')).toEqual({});
		expect(req('some-pkg')).toBe(pkg);
		expect(req.context().keys()).toEqual([]);
	});
});
