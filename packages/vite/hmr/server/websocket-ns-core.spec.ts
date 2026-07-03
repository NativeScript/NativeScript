import type { TransformResult } from 'vite';
import { describe, expect, it, vi } from 'vitest';

import { registerNsCoreRoute, type RegisterNsCoreRouteOptions } from './websocket-ns-core.js';
import { CORE_BUNDLE_PATH, type CoreBundleService, type CoreBundleState } from './core-bundle.js';

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
		statusCode: 0,
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

/**
 * Registers the core bridge against a fake connect server in PER-MODULE mode
 * (coreBundle: null) and returns its two middlewares (in order: the
 * `/node_modules/@nativescript/core` redirect, then the `/ns/core` bridge)
 * plus the injected spies.
 */
function mount(overrides: Partial<RegisterNsCoreRouteOptions> = {}) {
	const handlers: Handler[] = [];
	const sharedTransformRequest = vi.fn(async (_id: string): Promise<TransformResult | null> => null);
	const server = {
		middlewares: { use: (fn: Handler) => handlers.push(fn) },
		pluginContainer: { resolveId: vi.fn(async () => null) },
		config: { root: '/project' },
	} as any;
	const options: RegisterNsCoreRouteOptions = {
		getGraphVersion: () => 0,
		sharedTransformRequest,
		coreBundle: null,
		...overrides,
	};
	registerNsCoreRoute(server, options);
	expect(handlers).toHaveLength(2);
	const [redirect, bridge] = handlers;
	return { redirect, bridge, sharedTransformRequest };
}

function makeFakeBundleService(subs: string[], opts: { fail?: boolean } = {}): CoreBundleService {
	const state: CoreBundleState = {
		code: '/* fake core bundle */',
		subs: new Set(subs),
		hash: 'deadbeef',
		builtAt: Date.now(),
		buildMs: 1,
	};
	return {
		ensureBuilt: async () => (opts.fail ? null : state),
		getState: () => (opts.fail ? null : state),
		hasFailed: () => !!opts.fail,
	};
}

/**
 * Registers the route in BUNDLE mode with an injected fake bundle service.
 * Returns the three middlewares (bundle route, redirect, bridge).
 */
function mountBundleMode(subs: string[], opts: { fail?: boolean } = {}) {
	const handlers: Handler[] = [];
	const sharedTransformRequest = vi.fn(async (_id: string): Promise<TransformResult | null> => null);
	const server = {
		middlewares: { use: (fn: Handler) => handlers.push(fn) },
		pluginContainer: { resolveId: vi.fn(async () => null) },
		config: { root: '/project' },
	} as any;
	registerNsCoreRoute(server, {
		getGraphVersion: () => 0,
		sharedTransformRequest,
		coreBundle: makeFakeBundleService(subs, opts),
	});
	expect(handlers).toHaveLength(3);
	const [bundleRoute, redirect, bridge] = handlers;
	return { bundleRoute, redirect, bridge, sharedTransformRequest };
}

describe('registerNsCoreRoute', () => {
	it('registers exactly two middlewares', () => {
		mount();
	});

	describe('/node_modules/@nativescript/core redirect', () => {
		it('passes through unrelated paths without rewriting req.url', async () => {
			const { redirect } = mount();
			const req = { url: '/ns/m/app/main.ts' };
			const next = vi.fn();
			await redirect(req, makeRes(), next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(req.url).toBe('/ns/m/app/main.ts');
		});

		it('rewrites the package root (and index) to /ns/core', async () => {
			const { redirect } = mount();
			for (const url of ['/node_modules/@nativescript/core', '/node_modules/@nativescript/core/index.js', '/node_modules/@nativescript/core/index']) {
				const req = { url };
				const next = vi.fn();
				await redirect(req, makeRes(), next);
				expect(next).toHaveBeenCalledTimes(1);
				expect(req.url).toBe('/ns/core');
			}
		});

		it('rewrites a subpath to /ns/core/<sub>', async () => {
			const { redirect } = mount();
			const req = { url: '/node_modules/@nativescript/core/ui/frame' };
			const next = vi.fn();
			await redirect(req, makeRes(), next);
			expect(req.url).toBe('/ns/core/ui/frame');
		});
	});

	describe('/ns/core bridge', () => {
		it('passes through non-core paths', async () => {
			const { bridge, sharedTransformRequest } = mount();
			const next = vi.fn();
			const res = makeRes();
			await bridge({ url: '/ns/m/app/main.ts' }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.ended).toBe(false);
			expect(sharedTransformRequest).not.toHaveBeenCalled();
		});

		it('301-redirects a non-canonical core URL to its canonical path', async () => {
			const { bridge, sharedTransformRequest } = mount();
			const next = vi.fn();
			const res = makeRes();
			// `.js` is stripped by normalizeCoreSub → canonical is /ns/core/ui/frame.
			await bridge({ url: '/ns/core/ui/frame.js' }, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.statusCode).toBe(301);
			expect(res.headers['Location']).toBe('/ns/core/ui/frame');
			expect(res.ended).toBe(true);
			// A redirect must not invoke the transform pipeline.
			expect(sharedTransformRequest).not.toHaveBeenCalled();
		});
	});

	describe('bundle mode', () => {
		it('serves the bundle payload at /ns/core-bundle.mjs', async () => {
			const { bundleRoute } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			const next = vi.fn();
			await bundleRoute({ url: CORE_BUNDLE_PATH }, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.statusCode).toBe(200);
			expect(res.body).toBe('/* fake core bundle */');
		});

		it('returns 503 from /ns/core-bundle.mjs when the build failed', async () => {
			const { bundleRoute } = mountBundleMode([], { fail: true });
			const res = makeRes();
			await bundleRoute({ url: CORE_BUNDLE_PATH }, res, vi.fn());
			expect(res.statusCode).toBe(503);
			expect(res.body).toContain('core-bundle-build-failed');
		});

		it('bundle route passes through non-bundle paths (parseCoreBridgeRequest never sees it)', async () => {
			const { bundleRoute } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			const next = vi.fn();
			await bundleRoute({ url: '/ns/core/ui/frame' }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.ended).toBe(false);
		});

		it('serves the main shim at /ns/core without touching the transform pipeline', async () => {
			const { bridge, sharedTransformRequest } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			await bridge({ url: '/ns/core' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain(`export * from "${CORE_BUNDLE_PATH}";`);
			expect(res.body).toContain('export default __ns_core_bundle_ns__;');
			expect(sharedTransformRequest).not.toHaveBeenCalled();
		});

		it('serves a registry shim for a bundled subpath', async () => {
			const { bridge, sharedTransformRequest } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			await bridge({ url: '/ns/core/ui/frame' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain(`import "${CORE_BUNDLE_PATH}";`);
			expect(res.body).toContain(`["@nativescript/core/ui/frame"]`);
			expect(res.body).toContain('export default __ns_core_sub_ns__;');
			expect(sharedTransformRequest).not.toHaveBeenCalled();
		});

		it('falls back to per-module serving for a subpath not in the bundle enumeration', async () => {
			const { bridge, sharedTransformRequest } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			await bridge({ url: '/ns/core/debugger/webinspector-network' }, res, vi.fn());
			// The fake transform returns null → per-module path reports 500,
			// which proves the request went through the transform pipeline.
			expect(sharedTransformRequest).toHaveBeenCalled();
			expect(res.statusCode).toBe(500);
			expect(res.body).toContain('core-transform-failed');
		});

		it('falls back to per-module serving entirely when the bundle build failed', async () => {
			const { bridge, sharedTransformRequest } = mountBundleMode(['ui/frame'], { fail: true });
			const res = makeRes();
			await bridge({ url: '/ns/core/ui/frame' }, res, vi.fn());
			expect(sharedTransformRequest).toHaveBeenCalled();
			expect(res.statusCode).toBe(500);
			expect(res.body).toContain('core-transform-failed');
		});

		it('still 301-redirects non-canonical URLs before minting shims', async () => {
			const { bridge, sharedTransformRequest } = mountBundleMode(['ui/frame']);
			const res = makeRes();
			await bridge({ url: '/ns/core/ui/frame.js' }, res, vi.fn());
			expect(res.statusCode).toBe(301);
			expect(res.headers['Location']).toBe('/ns/core/ui/frame');
			expect(sharedTransformRequest).not.toHaveBeenCalled();
		});
	});
});
