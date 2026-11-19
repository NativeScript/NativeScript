import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockBuildRuntimeConfig = vi.fn();
vi.mock('./import-map.js', () => ({
	buildRuntimeConfig: (...args: unknown[]) => mockBuildRuntimeConfig(...args),
}));

vi.mock('node:fs', async (importOriginal) => ({
	...(await importOriginal<typeof import('node:fs')>()),
	statSync: (p: string) => {
		if (String(p).includes('/.vite/deps/')) throw Object.assign(new Error(`ENOENT: ${p}`), { code: 'ENOENT' });
		return { isFile: () => !String(p).endsWith('/node_modules/css-only') };
	},
}));

// The route derives the origin from the trusted, https-aware
// `getServerOrigin(server)` (NOT the client-supplied `Host` header). Mock it to
// a deterministic value so we can assert the route uses it verbatim.
const TRUSTED_ORIGIN = 'http://trusted-host:5173';
const mockGetServerOrigin = vi.fn(() => TRUSTED_ORIGIN);
vi.mock('./server-origin.js', () => ({
	getServerOrigin: (...args: unknown[]) => mockGetServerOrigin(...(args as [])),
}));

import { buildImportMap, IMPORT_MAP_PATH, nsImportMapPlugin, registerImportMapRoute, wouldDiscover, type RegisterImportMapRouteOptions } from './import-map-route.js';

type FakeRes = {
	statusCode: number;
	headers: Record<string, string | number>;
	body?: string;
	ended: boolean;
	setHeader(k: string, v: string | number): void;
	end(chunk?: unknown): unknown;
};

function makeRes(): FakeRes {
	return {
		// Node's ServerResponse defaults to 200; the handler only overrides it
		// for the 204 (OPTIONS) and 500 (error) paths.
		statusCode: 200,
		headers: {},
		ended: false,
		setHeader(k, v) {
			this.headers[k] = v;
		},
		end(chunk) {
			this.ended = true;
			if (chunk != null) this.body = String(chunk);
			return true;
		},
	};
}

type Handler = (req: any, res: any, next: any) => unknown;

function mount(overrides: Partial<RegisterImportMapRouteOptions> = {}) {
	const handlers: Handler[] = [];
	const resolveId = vi.fn(async (spec: string) => (spec === '@nativescript/core' ? { id: '/app/node_modules/@nativescript/core/index.js' } : null));
	const server = { config: { root: '/app' }, environments: { client: { pluginContainer: { resolveId } } }, middlewares: { use: (fn: Handler) => handlers.push(fn) } } as any;
	const getStrategy = vi.fn(() => ({ flavor: 'vue' }) as any);
	registerImportMapRoute(server, { getStrategy, ...overrides });
	expect(handlers).toHaveLength(1);
	return { handler: handlers[0], getStrategy, server };
}

describe('registerImportMapRoute', () => {
	beforeEach(() => {
		mockBuildRuntimeConfig.mockReset();
		mockBuildRuntimeConfig.mockReturnValue({
			specifiers: ['@nativescript/core'],
			volatilePatterns: ['/@ng/component'],
			canonicalization: { preserveQueryFor: [] },
		});
		mockGetServerOrigin.mockClear();
		mockGetServerOrigin.mockReturnValue(TRUSTED_ORIGIN);
	});

	it('registers exactly one middleware', () => {
		mount();
	});

	it('passes through unrelated paths without touching buildRuntimeConfig', async () => {
		const { handler } = mount();
		const next = vi.fn();
		const res = makeRes();
		await handler({ url: '/src/main.ts', method: 'GET', headers: {} }, res, next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.ended).toBe(false);
		expect(mockBuildRuntimeConfig).not.toHaveBeenCalled();
	});

	it('answers OPTIONS preflight with 204 + CORS and no body', async () => {
		const { handler } = mount();
		const next = vi.fn();
		const res = makeRes();
		await handler({ url: IMPORT_MAP_PATH, method: 'OPTIONS', headers: {} }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(204);
		expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
		expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, OPTIONS');
		expect(res.body).toBeUndefined();
		expect(mockBuildRuntimeConfig).not.toHaveBeenCalled();
	});

	it('serves the runtime config as JSON on GET', async () => {
		const { handler } = mount();
		const next = vi.fn();
		const res = makeRes();
		await handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: { host: 'localhost:5173' } }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
		expect(String(res.headers['Content-Type'])).toContain('application/json');
		expect(mockBuildRuntimeConfig).toHaveBeenCalledTimes(1);
		const parsed = JSON.parse(res.body || '{}');
		expect(parsed.importMap).toEqual({ imports: { '@nativescript/core': `${TRUSTED_ORIGIN}/node_modules/@nativescript/core/index.js` } });
		expect(parsed.volatilePatterns).toEqual(['/@ng/component']);
		expect(parsed.canonicalization).toEqual({ preserveQueryFor: [] });
	});

	it('uses the trusted server origin and IGNORES the client Host header', async () => {
		// Security: a spoofed Host header must NOT change the origin baked into
		// device module URLs. The origin comes from the
		// trusted getServerOrigin(server) resolver, called with the server.
		const { handler, server } = mount();
		const res = makeRes();
		await handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: { host: 'attacker.example:9000' } }, res, vi.fn());
		expect(mockGetServerOrigin).toHaveBeenCalledWith(server);
		expect(mockBuildRuntimeConfig).toHaveBeenCalledWith(expect.objectContaining({ origin: TRUSTED_ORIGIN }));
	});

	it('uses the trusted origin even when the Host header is absent', async () => {
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: {} }, res, vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenCalledWith(expect.objectContaining({ origin: TRUSTED_ORIGIN }));
	});

	it('forwards the injected strategy (and its flavor), defaulting to typescript when none', async () => {
		// buildRuntimeConfig consults `strategy.importMapEntries` /
		// `strategy.volatilePatterns`, so the route must thread the whole strategy
		// (not just the flavor string).
		const ng = mount({ getStrategy: () => ({ flavor: 'angular' }) as any });
		await ng.handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: {} }, makeRes(), vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenLastCalledWith(expect.objectContaining({ flavor: 'angular', strategy: expect.objectContaining({ flavor: 'angular' }) }));

		const none = mount({ getStrategy: () => undefined });
		await none.handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: {} }, makeRes(), vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenLastCalledWith(expect.objectContaining({ flavor: 'typescript', strategy: undefined }));
	});

	it("collects the keys from the app's project root and resolves each one on every request", async () => {
		mockBuildRuntimeConfig.mockReturnValue({ specifiers: ['@nativescript/core', 'missing'], volatilePatterns: [], canonicalization: { preserveQueryFor: [] } });
		const { handler, server } = mount();
		for (let i = 0; i < 2; i++) {
			const res = makeRes();
			await handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: {} }, res, vi.fn());
			expect(JSON.parse(res.body || '{}').importMap).toEqual({ imports: { '@nativescript/core': `${TRUSTED_ORIGIN}/node_modules/@nativescript/core/index.js` } });
		}
		expect(mockBuildRuntimeConfig).toHaveBeenCalledWith(expect.objectContaining({ projectRoot: '/app' }));
		expect(server.environments.client.pluginContainer.resolveId).toHaveBeenCalledTimes(4);
	});

	it('responds 500 when config generation throws', async () => {
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockBuildRuntimeConfig.mockImplementation(() => {
			throw new Error('boom');
		});
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: IMPORT_MAP_PATH, method: 'GET', headers: {} }, res, vi.fn());
		expect(res.statusCode).toBe(500);
		expect(JSON.parse(res.body || '{}')).toEqual({ error: 'Failed to generate import map' });
		errSpy.mockRestore();
	});
});

describe('nsImportMapPlugin', () => {
	it('serves the import map from the dev server only', () => {
		const plugin = nsImportMapPlugin({ flavor: 'vue' });
		expect(plugin.apply).toBe('serve');
		const use = vi.fn();
		(plugin.configureServer as (server: any) => void)({ middlewares: { use } });
		expect(use).toHaveBeenCalledTimes(1);
	});
});

describe('buildImportMap', () => {
	it("maps each bare specifier to its resolved file's Vite URL on the origin, /@fs outside the root", async () => {
		const ids: Record<string, string> = { '@nativescript/core': '/app/node_modules/@nativescript/core/index.js', linked: '/repo/packages/linked/index.js' };
		const server = { config: { root: '/app' }, environments: { client: { pluginContainer: { resolveId: async (spec: string) => (ids[spec] ? { id: ids[spec] } : null) } } } } as any;
		expect(await buildImportMap(server, ['@nativescript/core', 'linked', 'missing', 'pkg/'], `${TRUSTED_ORIGIN}/`)).toEqual({
			'@nativescript/core': `${TRUSTED_ORIGIN}/node_modules/@nativescript/core/index.js`,
			linked: `${TRUSTED_ORIGIN}/@fs/repo/packages/linked/index.js`,
		});
	});

	it("keeps the resolver's `?v=` query, as Vite's import analysis writes it into served code", async () => {
		const ids: Record<string, string> = {
			excluded: '/app/node_modules/excluded/index.js?v=meta1234',
			optimized: '/app/node_modules/.vite/deps/optimized.js?v=dep5678',
		};
		const isOptimizedDepFile = vi.fn((file: string) => file.includes('/.vite/deps/'));
		const server = { config: { root: '/app' }, environments: { client: { depsOptimizer: { isOptimizedDepFile, options: { noDiscovery: true } }, pluginContainer: { resolveId: async (spec: string) => ({ id: ids[spec] }) } } } } as any;
		expect(await buildImportMap(server, ['excluded', 'optimized'], TRUSTED_ORIGIN)).toEqual({
			excluded: `${TRUSTED_ORIGIN}/node_modules/excluded/index.js?v=meta1234`,
			optimized: `${TRUSTED_ORIGIN}/node_modules/.vite/deps/optimized.js?v=dep5678`,
		});
	});

	it('maps an optimized dependency whose file the optimizer has not written yet', async () => {
		const server = {
			config: { root: '/app' },
			environments: { client: { depsOptimizer: { isOptimizedDepFile: () => true, options: { noDiscovery: true } }, pluginContainer: { resolveId: async () => ({ id: '/app/node_modules/.vite/deps/fresh.js?v=abcd' }) } } },
		} as any;
		expect(await buildImportMap(server, ['fresh'], TRUSTED_ORIGIN)).toEqual({ fresh: `${TRUSTED_ORIGIN}/node_modules/.vite/deps/fresh.js?v=abcd` });
	});

	it('gives no entry to an external, unresolvable or throwing specifier', async () => {
		const resolveId = async (spec: string) => {
			if (spec === 'boom') throw new Error('resolver failed');
			return spec === 'ext' ? { id: 'ext', external: true } : null;
		};
		const server = { config: { root: '/app' }, environments: { client: { pluginContainer: { resolveId } } } } as any;
		expect(await buildImportMap(server, ['ext', 'missing', 'boom'], TRUSTED_ORIGIN)).toEqual({});
	});

	it('leaves out a specifier that resolves to a directory', async () => {
		const server = { config: { root: '/app' }, environments: { client: { pluginContainer: { resolveId: async () => ({ id: '/repo/node_modules/css-only' }) } } } } as any;
		expect(await buildImportMap(server, ['css-only'], TRUSTED_ORIGIN)).toEqual({});
	});

	it('lets Vite serve every mapped file outside fs.allow, as it does files its import analysis resolved', async () => {
		const ids: Record<string, string> = { hoisted: '/repo/node_modules/hoisted/index.js', 'css-only': '/repo/node_modules/css-only' };
		const safeModulePaths = new Set<string>();
		const server = { config: { root: '/app', safeModulePaths }, environments: { client: { pluginContainer: { resolveId: async (spec: string) => ({ id: ids[spec] }) } } } } as any;
		await buildImportMap(server, ['hoisted', 'css-only'], TRUSTED_ORIGIN);
		expect([...safeModulePaths]).toEqual(['/repo/node_modules/hoisted/index.js']);
	});

	it('leaves out a dependency resolving it would register with a discovering optimizer, and resolves every other key normally', async () => {
		const resolveId = vi.fn(async (spec: string, _importer: string, options?: { scan?: boolean }) => ({ id: `/app/node_modules/${spec}/index.js${options?.scan ? '' : '?v=abcd'}` }));
		const depsOptimizer = { options: { exclude: ['excluded'] }, metadata: { optimized: {}, discovered: {}, chunks: {} }, isOptimizedDepFile: () => false };
		const server = { config: { root: '/app' }, environments: { client: { depsOptimizer, pluginContainer: { resolveId } } } } as any;
		expect(await buildImportMap(server, ['excluded', 'unscanned'], TRUSTED_ORIGIN)).toEqual({ excluded: `${TRUSTED_ORIGIN}/node_modules/excluded/index.js?v=abcd` });
		expect(resolveId.mock.calls.filter(([spec, , options]) => spec === 'unscanned' && !options?.scan)).toEqual([]);
	});
});

describe('wouldDiscover', () => {
	const metadata = { optimized: { known: {} }, discovered: { pending: {} }, chunks: {} };
	const optimizer = (options: Record<string, unknown> = {}) => ({ options: { exclude: ['@nativescript/core'], ...options }, metadata, scanProcessing: undefined }) as any;
	const scanResolve = vi.fn(async (spec: string) => ({ id: spec === 'linked' ? '/repo/packages/linked/index.js' : `/app/node_modules/${spec}/index.js` }));

	it('is true only for a dependency the optimizer does not know yet that resolves into node_modules', async () => {
		expect(await wouldDiscover(optimizer(), 'unknown', scanResolve)).toBe(true);
		expect(await wouldDiscover(optimizer(), 'known', scanResolve)).toBe(false);
		expect(await wouldDiscover(optimizer(), 'pending', scanResolve)).toBe(false);
		expect(await wouldDiscover(optimizer(), 'linked', scanResolve)).toBe(false);
	});

	it('is false for an excluded package or subpath and for an optimizer without discovery, without resolving', async () => {
		scanResolve.mockClear();
		expect(await wouldDiscover(optimizer(), '@nativescript/core', scanResolve)).toBe(false);
		expect(await wouldDiscover(optimizer(), '@nativescript/core/ui', scanResolve)).toBe(false);
		expect(await wouldDiscover(optimizer({ noDiscovery: true }), 'unknown', scanResolve)).toBe(false);
		expect(scanResolve).not.toHaveBeenCalled();
	});

	it('reads what the optimizer knows only once its scan is done', async () => {
		const md = { optimized: {} as Record<string, unknown>, discovered: {}, chunks: {} };
		const scanProcessing = new Promise<void>((resolve) =>
			setTimeout(() => {
				md.optimized.scanned = {};
				resolve();
			}, 5),
		);
		expect(await wouldDiscover({ options: {}, metadata: md, scanProcessing } as any, 'scanned', scanResolve)).toBe(false);
	});
});
