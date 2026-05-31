import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockBuildRuntimeConfig = vi.fn();
vi.mock('./import-map.js', () => ({
	buildRuntimeConfig: (...args: unknown[]) => mockBuildRuntimeConfig(...args),
}));

import { registerImportMapRoute, type RegisterImportMapRouteOptions } from './websocket-import-map-route.js';

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
	const server = { middlewares: { use: (fn: Handler) => handlers.push(fn) } } as any;
	const getStrategy = vi.fn(() => ({ flavor: 'vue' }) as any);
	registerImportMapRoute(server, { getStrategy, ...overrides });
	expect(handlers).toHaveLength(1);
	return { handler: handlers[0], getStrategy };
}

describe('registerImportMapRoute', () => {
	beforeEach(() => {
		mockBuildRuntimeConfig.mockReset();
		mockBuildRuntimeConfig.mockReturnValue({
			importMap: JSON.stringify({ imports: { '@nativescript/core': 'http://localhost:5173/ns/core' } }),
			volatilePatterns: ['?v=', '&v='],
		});
	});

	it('registers exactly one middleware', () => {
		mount();
	});

	it('passes through unrelated paths without touching buildRuntimeConfig', async () => {
		const { handler } = mount();
		const next = vi.fn();
		const res = makeRes();
		await handler({ url: '/ns/entry', method: 'GET', headers: {} }, res, next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.ended).toBe(false);
		expect(mockBuildRuntimeConfig).not.toHaveBeenCalled();
	});

	it('answers OPTIONS preflight with 204 + CORS and no body', async () => {
		const { handler } = mount();
		const next = vi.fn();
		const res = makeRes();
		await handler({ url: '/ns/import-map.json', method: 'OPTIONS', headers: {} }, res, next);
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
		await handler({ url: '/ns/import-map.json', method: 'GET', headers: { host: 'localhost:5173' } }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
		expect(String(res.headers['Content-Type'])).toContain('application/json');
		expect(mockBuildRuntimeConfig).toHaveBeenCalledTimes(1);
		const parsed = JSON.parse(res.body || '{}');
		expect(parsed.importMap).toEqual({ imports: { '@nativescript/core': 'http://localhost:5173/ns/core' } });
		expect(parsed.volatilePatterns).toEqual(['?v=', '&v=']);
	});

	it('derives the origin from the request Host header', async () => {
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: '/ns/import-map.json', method: 'GET', headers: { host: 'device.local:9000' } }, res, vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenCalledWith(expect.objectContaining({ origin: 'http://device.local:9000' }));
	});

	it('falls back to localhost:5173 when the Host header is missing', async () => {
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: '/ns/import-map.json', method: 'GET', headers: {} }, res, vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenCalledWith(expect.objectContaining({ origin: 'http://localhost:5173' }));
	});

	it('forwards the injected strategy flavor and defaults to typescript', async () => {
		const ng = mount({ getStrategy: () => ({ flavor: 'angular' }) as any });
		await ng.handler({ url: '/ns/import-map.json', method: 'GET', headers: {} }, makeRes(), vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenLastCalledWith(expect.objectContaining({ flavor: 'angular' }));

		const none = mount({ getStrategy: () => undefined });
		await none.handler({ url: '/ns/import-map.json', method: 'GET', headers: {} }, makeRes(), vi.fn());
		expect(mockBuildRuntimeConfig).toHaveBeenLastCalledWith(expect.objectContaining({ flavor: 'typescript' }));
	});

	it('responds 500 when config generation throws', async () => {
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockBuildRuntimeConfig.mockImplementation(() => {
			throw new Error('boom');
		});
		const { handler } = mount();
		const res = makeRes();
		await handler({ url: '/ns/import-map.json', method: 'GET', headers: {} }, res, vi.fn());
		expect(res.statusCode).toBe(500);
		expect(JSON.parse(res.body || '{}')).toEqual({ error: 'Failed to generate import map' });
		errSpy.mockRestore();
	});
});
