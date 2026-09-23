import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./typescript.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('./typescript.js')>();
	return { ...actual, loadTypeScript: () => null };
});

import { transformNativeClassSource } from './nativeclass-transform.js';
import { postCleanupNativeClass } from './nativeclass-transformer-plugin.js';

const DECORATED_TS = `
@NativeClass()
export class TimerTargetImpl extends NSObject {
	tick() {}
}
`;

const DECORATED_JS = `
let Impl = class Impl extends NSObject {};
Impl = __decorate([NativeClass()], Impl);
export { Impl };
`;

describe('NativeClass transforms when typescript is not installed', () => {
	let warn: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		warn.mockRestore();
	});

	it('stays silent for sources that never needed the compiler', () => {
		expect(transformNativeClassSource('export const x = 1;', '/app/x.js')).toBeNull();
		expect(transformNativeClassSource('function ensureNativeClasses() {}', '/app/core.js')).toBeNull();
		expect(transformNativeClassSource('const Foo = __decorate([Component()], Foo);', '/app/foo.js')).toBeNull();
		expect(postCleanupNativeClass('export const x = 1;', '/app/x')).toBeNull();
		expect(postCleanupNativeClass('function ensureNativeClasses() {}\nlet Foo = __decorate([Component()], Foo);', '/app/core')).toBeNull();
		expect(warn).not.toHaveBeenCalled();
	});

	it('leaves decorated sources untouched and warns once', () => {
		expect(transformNativeClassSource(DECORATED_TS, '/app/timer.ts')).toBeNull();
		expect(transformNativeClassSource(DECORATED_JS, '/node_modules/plugin/index.js')).toBeNull();
		expect(postCleanupNativeClass(DECORATED_JS, '/node_modules/plugin/index')).toBeNull();
		expect(warn).toHaveBeenCalledTimes(1);
		expect(String(warn.mock.calls[0][0])).toContain('/app/timer.ts');
		expect(String(warn.mock.calls[0][0])).toContain("'typescript'");
	});
});
