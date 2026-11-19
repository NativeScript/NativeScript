import { beforeEach, describe, expect, it, vi } from 'vitest';

const runAngularLinker = vi.fn(async () => 'linked');
vi.mock('./shared-linker.js', () => ({ runAngularLinker: (...args: unknown[]) => runAngularLinker(...(args as [])) }));

import { angularLinkerVitePlugin, angularLinkerVitePluginPost } from './angular-linker.js';

const partial = 'export class A {}\nA.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.0.0", type: A });\n';
const ctx = { environment: { depsOptimizer: { isOptimizedDepFile: (id: string) => id.includes('/node_modules/.vite/deps/') } } };
const call = (hook: any, ...args: unknown[]) => (typeof hook === 'function' ? hook : hook.handler).call(ctx, ...args);

describe('serve-time Angular linker plugins', () => {
	beforeEach(() => runAngularLinker.mockClear());

	it('leave optimized deps alone: the optimizer already linked them', async () => {
		const pre = angularLinkerVitePlugin('/app');
		const post = angularLinkerVitePluginPost('/app');
		const dep = '/app/node_modules/.vite/deps/core-AbC123.js?v=1234abcd';
		expect(await call(pre.load, dep)).toBeNull();
		expect(await call(pre.transform, partial, dep)).toBeNull();
		expect(await call(post.transform, partial, dep)).toBeNull();
		expect(runAngularLinker).not.toHaveBeenCalled();
	});

	it('still link a served Angular package file', async () => {
		const file = '/app/node_modules/@angular/core/fesm2022/core.mjs?v=1234abcd';
		expect(await call(angularLinkerVitePlugin('/app').transform, partial, file)).toEqual({ code: 'linked', map: null });
		expect(await call(angularLinkerVitePluginPost('/app').transform, partial, file)).toEqual({ code: 'linked', map: null });
	});
});
