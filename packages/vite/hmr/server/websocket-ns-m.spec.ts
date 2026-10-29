import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerNsModuleServerRoute, type RegisterNsModuleServerRouteOptions } from './websocket-ns-m.js';
import { interceptNgComponentRequest } from '../frameworks/angular/server/ng-component-route.js';

type FakeRes = {
	statusCode: number;
	headers: Record<string, string | number>;
	body?: string;
	setHeader(k: string, v: string | number): void;
	write(chunk?: unknown): boolean;
	end(chunk?: unknown): unknown;
};

function makeRes(): FakeRes {
	return {
		statusCode: 0,
		headers: {},
		setHeader(k, v) {
			this.headers[k] = v;
		},
		write(chunk) {
			this.body = (this.body ?? '') + String(chunk ?? '');
			return true;
		},
		end(chunk) {
			this.body = chunk == null ? (this.body ?? '') : String(chunk);
			return true;
		},
	};
}

type Handler = (req: any, res: any, next: any) => unknown;

/**
 * Registers the `/ns/m` module server against a fake connect server and returns
 * the single middleware plus the injected spies, so tests can drive the handler
 * directly without a real transform pipeline or filesystem.
 */
function mount(overrides: Partial<RegisterNsModuleServerRouteOptions> = {}) {
	const handlers: Handler[] = [];
	const ensureInitialGraphPopulationStarted = vi.fn();
	const upsertGraphModule = vi.fn();
	const server = {
		middlewares: { use: (fn: Handler) => handlers.push(fn) },
		transformRequest: vi.fn(async (_id: string) => null as { code: string } | null),
		config: { root: '/project' },
	} as any;
	const options: RegisterNsModuleServerRouteOptions = {
		verbose: false,
		appVirtualWithSlash: '/app/',
		sfcFileMap: new Map(),
		depFileMap: new Map(),
		getGraphVersion: () => 0,
		getStrategy: () => ({}) as any,
		cleanCode: (code) => code,
		processCodeForDevice: (code) => code,
		rewriteImports: (code) => code,
		prepareAngularEntryForDevice: (code) => code,
		sharedTransformRequest: async () => null,
		collectImportDependencies: () => new Set<string>(),
		ensureInitialGraphPopulationStarted,
		upsertGraphModule,
		// Per-module node_modules serving: the deps-bundle suite covers shims.
		depsBundle: null,
		...overrides,
	};
	registerNsModuleServerRoute(server, options);
	expect(handlers).toHaveLength(1);
	return { handler: handlers[0], server, ensureInitialGraphPopulationStarted, upsertGraphModule };
}

describe('registerNsModuleServerRoute', () => {
	it('registers exactly one middleware', () => {
		mount();
	});

	it('passes through non-/ns/m paths without responding or touching the graph', async () => {
		const { handler, ensureInitialGraphPopulationStarted } = mount();
		for (const url of ['/ns/sfc?path=/a.vue', '/ns/core', '/ns/entry', '/node_modules/foo', '/']) {
			const next = vi.fn();
			const res = makeRes();
			await handler({ url }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.body).toBeUndefined();
		}
		expect(ensureInitialGraphPopulationStarted).not.toHaveBeenCalled();
	});

	it('serves an empty module and kicks off background graph population when no path is supplied', async () => {
		const { handler, ensureInitialGraphPopulationStarted } = mount();
		const res = makeRes();
		const next = vi.fn();
		await handler({ url: '/ns/m' }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.body).toBe('export {}\n');
		expect(ensureInitialGraphPopulationStarted).toHaveBeenCalledTimes(1);
	});

	it('serves the text Vite loads for a ?raw import, without the device passes', async () => {
		const sharedTransformRequest = vi.fn(async (url: string) => (url === '/src/icon.svg?raw' ? ({ code: 'export default "<svg/>"' } as any) : null));
		const processCodeForDevice = vi.fn((code: string) => code);
		const { handler } = mount({ sharedTransformRequest, processCodeForDevice });
		const res = makeRes();
		await handler({ url: '/ns/m/src/icon.svg?raw' }, res, vi.fn());
		expect(res.statusCode).toBe(200);
		expect(res.body).toBe('export default "<svg/>"');
		expect(processCodeForDevice).not.toHaveBeenCalled();
	});

	it('does not read the raw=1 diagnostics flag as ?raw', async () => {
		const sharedTransformRequest = vi.fn(async () => null);
		const { handler } = mount({ sharedTransformRequest });
		await handler({ url: '/ns/m/src/app.ts?raw=1' }, makeRes(), vi.fn());
		expect(sharedTransformRequest.mock.calls.map(([url]) => url)).not.toContain('/src/app.ts?raw');
	});

	it('serves a deterministic stub for the anomalous "@" import path', async () => {
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: '/ns/m/__invalid_at__.mjs' }, res, vi.fn());
		expect(res.statusCode).toBe(200);
		expect(res.body).toContain("invalid '@' import stub");
		expect(res.body).toContain('export {}');
	});

	describe('AnalogJS /@ng/component delegation (Angular interceptModuleRequest hook)', () => {
		// The /@ng/component interception is Angular policy: the shared route
		// only calls `strategy.interceptModuleRequest`, and the Angular server
		// strategy delegates to `interceptNgComponentRequest`.
		const angularInterception = { getStrategy: () => ({ interceptModuleRequest: interceptNgComponentRequest }) as any };

		it('delegates to downstream and substitutes a valid empty module for an empty body', async () => {
			const { handler, ensureInitialGraphPopulationStarted } = mount({ ...angularInterception });
			const res = makeRes();
			// AnalogJS responds with an empty body for non-invalidated component ids.
			const next = vi.fn(() => {
				res.end('');
			});
			await handler({ url: '/ns/m/app/foo/@ng/component?c=1&t=2' }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			// Delegation happens before background graph population is kicked off.
			expect(ensureInitialGraphPopulationStarted).not.toHaveBeenCalled();
			expect(res.body).toContain('export {};');
			expect(res.headers['Content-Length']).toBe(Buffer.byteLength(res.body as string, 'utf8'));
		});

		it('passes a non-empty downstream body through unchanged', async () => {
			const { handler } = mount({ ...angularInterception });
			const res = makeRes();
			const payload = 'export const __metadata = 1;';
			const next = vi.fn(() => {
				res.write('export const __metadata');
				res.end(' = 1;');
			});
			await handler({ url: '/ns/m/app/foo/@ng/component?c=1&t=2' }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.body).toBe(payload);
		});

		describe('live-broadcast gate (isLiveAngularComponentUpdateFetch)', () => {
			it('answers a boot-time fetch (no matching broadcast) with the no-update stub without delegating', async () => {
				const gate = vi.fn(() => false);
				const { handler } = mount({ ...angularInterception, isLiveAngularComponentUpdateFetch: gate });
				const res = makeRes();
				const next = vi.fn();
				await handler({ url: '/ns/m/src/app/@ng/component?c=src%2Fapp%2Fapp.component.ts%40AppComponent&t=1783270000000' }, res, next);
				expect(next).not.toHaveBeenCalled();
				// The gate sees the URLSearchParams-decoded id and numeric timestamp.
				expect(gate).toHaveBeenCalledWith('src/app/app.component.ts@AppComponent', 1783270000000);
				expect(res.statusCode).toBe(200);
				expect(res.headers['Content-Type']).toBe('text/javascript');
				expect(res.body).toContain('export {};');
			});

			it('delegates to downstream when the fetch matches a recorded broadcast', async () => {
				const { handler } = mount({
					...angularInterception,
					isLiveAngularComponentUpdateFetch: (id, t) => id === 'src/app/foo.component.ts@FooComponent' && t === 42,
				});
				const res = makeRes();
				const payload = 'export default function FooComponent_UpdateMetadata() {}';
				const next = vi.fn(() => {
					res.end(payload);
				});
				await handler({ url: '/ns/m/src/app/@ng/component?c=src%2Fapp%2Ffoo.component.ts%40FooComponent&t=42' }, res, next);
				expect(next).toHaveBeenCalledTimes(1);
				expect(res.body).toBe(payload);
			});

			it('answers fetches with a missing or non-numeric timestamp with the stub', async () => {
				const gate = vi.fn(() => true);
				const { handler } = mount({ ...angularInterception, isLiveAngularComponentUpdateFetch: gate });
				for (const url of ['/ns/m/src/app/@ng/component?c=src%2Fapp%2Ffoo.component.ts%40FooComponent', '/ns/m/src/app/@ng/component?c=src%2Fapp%2Ffoo.component.ts%40FooComponent&t=abc', '/ns/m/src/app/@ng/component?t=42']) {
					const res = makeRes();
					const next = vi.fn();
					await handler({ url }, res, next);
					expect(next).not.toHaveBeenCalled();
					expect(res.body).toContain('export {};');
				}
				expect(gate).not.toHaveBeenCalled();
			});
		});
	});
});

describe('native default-import link checking', () => {
	beforeEach(() => vi.stubEnv('NODE_ENV', 'development'));
	afterEach(() => vi.unstubAllEnvs());

	const importer = "import value from 'http://localhost:5173/ns/m/src/target.mjs'; export { value };";

	function mountLinkCheck(source: string) {
		let targetCode = source;
		let graphVersion = 0;
		const fixture = mount({
			sharedTransformRequest: async () => ({ code: importer, map: null }),
			getGraphVersion: () => graphVersion,
		});
		fixture.server.transformRequest.mockImplementation(async () => ({ code: targetCode }));
		return {
			async rejects() {
				fixture.server.transformRequest.mockClear();
				const res = makeRes();
				await fixture.handler({ url: '/ns/m/src/importer.mjs' }, res, vi.fn());
				expect(res.statusCode).toBe(200);
				expect(fixture.server.transformRequest).toHaveBeenCalled();
				expect(res.body).toContain('export');
				return res.body!.includes('[link-check] Missing default export');
			},
			edit(source: string) {
				targetCode = source;
				graphVersion++;
			},
		};
	}

	it.each([
		['direct', 'export default 17;', false],
		['function', 'export default function named() {}', false],
		['class', 'export default class Named {}', false],
		['alias', 'const named = 23; export { named as default };', false],
		['multiple specifiers', 'const named = 23, other = 1; export { other, named as default };', false],
		['quoted name', 'const named = 23; export { named as "default" };', false],
		['default re-export', 'export { default } from "./base.mjs";', false],
		['aliased re-export', 'export { other as default } from "./base.mjs";', false],
		['namespace re-export', 'export * as default from "./base.mjs";', false],
		['named only', 'export const named = 99;', true],
		['star re-export', 'export * from "./base.mjs";', true],
		['comment', '// export default 17;\nexport const named = 99;', true],
		['string', 'export const text = "export default 17";', true],
		['type-only declaration', 'export type { Value as default } from "./types";', true],
		['type-only specifier', 'export { type Value as default } from "./types";', true],
		['CommonJS module.exports', 'module.exports = 17;', false],
		['CommonJS exports', 'exports.named = 17;', false],
	] as const)('%s', async (_name, source, rejected) => {
		expect(await mountLinkCheck(source).rejects()).toBe(rejected);
	});

	it('keeps checking later imports when a target cannot be parsed', async () => {
		const fixture = mount({
			sharedTransformRequest: async () => ({
				code: "import a from 'http://localhost:5173/ns/m/src/a.mjs'; import b from 'http://localhost:5173/ns/m/src/b.mjs'; export { a, b };",
				map: null,
			}),
		});
		fixture.server.transformRequest.mockImplementation(async (url: string) => ({ code: url.includes('/a.mjs') ? 'export default (;' : 'export const named = 99;' }));
		const res = makeRes();
		await fixture.handler({ url: '/ns/m/src/importer.mjs' }, res, vi.fn());
		expect(res.body).toContain('[link-check] Missing default export in /ns/m/src/b.mjs');
	});

	it('rechecks the same importer after its target gains or loses a default', async () => {
		const fixture = mountLinkCheck('export const named = 99;');
		expect(await fixture.rejects()).toBe(true);
		fixture.edit('const named = 23; export { named as default };');
		expect(await fixture.rejects()).toBe(false);
		fixture.edit('export const named = 99;');
		expect(await fixture.rejects()).toBe(true);
		fixture.edit('export default 17;');
		expect(await fixture.rejects()).toBe(false);
	});
});
