import { describe, expect, it, vi } from 'vitest';

import { registerNsCoreRoute, type RegisterNsCoreRouteOptions } from './websocket-ns-core.js';

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
 * Registers the core bridge against a fake connect server and returns its two
 * middlewares (in order: the `/node_modules/@nativescript/core` redirect, then
 * the `/ns/core` bridge) plus the injected spies.
 */
function mount(overrides: Partial<RegisterNsCoreRouteOptions> = {}) {
	const handlers: Handler[] = [];
	const sharedTransformRequest = vi.fn(async (_id: string) => null as { code: string } | null);
	const server = {
		middlewares: { use: (fn: Handler) => handlers.push(fn) },
		pluginContainer: { resolveId: vi.fn(async () => null) },
		config: { root: '/project' },
	} as any;
	const options: RegisterNsCoreRouteOptions = {
		getGraphVersion: () => 0,
		sharedTransformRequest,
		...overrides,
	};
	registerNsCoreRoute(server, options);
	expect(handlers).toHaveLength(2);
	const [redirect, bridge] = handlers;
	return { redirect, bridge, sharedTransformRequest };
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
});
