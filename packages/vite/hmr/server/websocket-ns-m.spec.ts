import { describe, expect, it, vi } from 'vitest';

import { registerNsModuleServerRoute, type RegisterNsModuleServerRouteOptions } from './websocket-ns-m.js';

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
	return { handler: handlers[0], ensureInitialGraphPopulationStarted, upsertGraphModule };
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

	it('serves a deterministic stub for the anomalous "@" import path', async () => {
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: '/ns/m/__invalid_at__.mjs' }, res, vi.fn());
		expect(res.statusCode).toBe(200);
		expect(res.body).toContain("invalid '@' import stub");
		expect(res.body).toContain('export {}');
	});

	describe('AnalogJS /@ng/component delegation', () => {
		it('delegates to downstream and substitutes a valid empty module for an empty body', async () => {
			const { handler, ensureInitialGraphPopulationStarted } = mount();
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
			const { handler } = mount();
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
				const { handler } = mount({ isLiveAngularComponentUpdateFetch: gate });
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
				const { handler } = mount({ isLiveAngularComponentUpdateFetch: gate });
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
