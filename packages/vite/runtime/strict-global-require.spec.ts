import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const g = globalThis as any;
const hadRequire = Object.prototype.hasOwnProperty.call(g, 'require');
const previousRequire = g.require;

async function install(runtimeRequire: unknown) {
	vi.resetModules();
	if (runtimeRequire === undefined) delete g.require;
	else g.require = runtimeRequire;
	await import('./strict-global-require.js');
	return g.require as (...args: unknown[]) => unknown;
}

describe('strict global require', () => {
	let runtimeRequire: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		runtimeRequire = vi.fn(function (this: unknown, specifier: string) {
			return { self: this, specifier };
		});
	});

	afterEach(() => {
		if (hadRequire) g.require = previousRequire;
		else delete g.require;
	});

	it('stays a function', async () => {
		expect(typeof (await install(runtimeRequire))).toBe('function');
		expect(typeof (await install(undefined))).toBe('function');
	});

	it('hands absolute paths and file: URLs to the runtime require, with its receiver and arguments', async () => {
		const shadow = await install(runtimeRequire);
		expect(shadow.call(g, '/data/app/worker.js')).toEqual({ self: g, specifier: '/data/app/worker.js' });
		expect(shadow('file:///data/app/worker.js', 'extra')).toEqual({ self: undefined, specifier: 'file:///data/app/worker.js' });
		expect(runtimeRequire).toHaveBeenLastCalledWith('file:///data/app/worker.js', 'extra');
	});

	it.each(['lodash', '@nativescript/core', './local.js', '../up.js', 'http://192.168.1.2:5173/src/a.ts', 'https://example.com/a.js', '//host/a.js', 'ns:module', 'node:url'])('throws for %s, naming it', async (specifier) => {
		const shadow = await install(runtimeRequire);
		expect(() => shadow(specifier)).toThrow(`require(${JSON.stringify(specifier)}): the global require is not available in dev`);
		expect(runtimeRequire).not.toHaveBeenCalled();
	});

	it("hands the Android inspector's bare inspector_modules load to the runtime require", async () => {
		const shadow = await install(runtimeRequire);
		shadow('inspector_modules');
		expect(runtimeRequire).toHaveBeenLastCalledWith('inspector_modules');
		expect(() => shadow('inspector_modules/x')).toThrow(/global require is not available/);
	});

	it('throws for absolute paths too when there was no runtime require', async () => {
		const shadow = await install(undefined);
		expect(() => shadow('/data/app/worker.js')).toThrow(/the global require is not available in dev/);
	});
});
