import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';

// Isolate the route from the bridge builder + vendor discovery (both covered by
// ns-rt-bridge.spec.ts). The route's own contract is: path matching, version
// selection, response headers, and delegation to the builder.
const { buildNsRtBridgeModule, discoverNsvBridgeExports } = vi.hoisted(() => ({
	buildNsRtBridgeModule: vi.fn(() => 'BRIDGE_CODE'),
	discoverNsvBridgeExports: vi.fn(() => new Set(['ref', 'createApp'])),
}));
vi.mock('./ns-rt-bridge.js', () => ({ buildNsRtBridgeModule, discoverNsvBridgeExports }));

import { registerNsRtBridgeRoute } from './ns-rt-route.js';

type FakeRes = {
	statusCode: number;
	headers: Record<string, string>;
	body?: string;
	setHeader(k: string, v: string): void;
	end(body?: string): void;
};

function makeRes(): FakeRes {
	return {
		statusCode: 0,
		headers: {},
		setHeader(k, v) {
			this.headers[k] = v;
		},
		end(body) {
			this.body = body ?? '';
		},
	};
}

// Register the route against a fake connect server and hand back the single
// middleware it mounts, so each test can invoke it directly.
function mountRoute(graphVersion = 0) {
	let handler: ((req: any, res: any, next: any) => unknown) | undefined;
	const server = { middlewares: { use: (fn: typeof handler) => (handler = fn) } } as any;
	registerNsRtBridgeRoute(server, { getGraphVersion: () => graphVersion });
	if (!handler) throw new Error('route did not register a middleware');
	return handler;
}

describe('registerNsRtBridgeRoute', () => {
	beforeEach(() => {
		buildNsRtBridgeModule.mockClear();
		discoverNsvBridgeExports.mockClear();
	});

	it('passes through non-/ns/rt requests without responding', async () => {
		const handler = mountRoute(7);
		const res = makeRes();
		const next = vi.fn();
		await handler({ url: '/ns/m/src/app.ts' }, res, next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.body).toBeUndefined();
		expect(buildNsRtBridgeModule).not.toHaveBeenCalled();
	});

	it('serves the bridge for /ns/rt, tagging it with the current graph version', async () => {
		const handler = mountRoute(7);
		const res = makeRes();
		const next = vi.fn();
		await handler({ url: '/ns/rt' }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.headers['Content-Type']).toBe('application/javascript; charset=utf-8');
		expect(res.headers['Cache-Control']).toContain('no-store');
		expect(res.body).toBe('BRIDGE_CODE');
		expect(buildNsRtBridgeModule).toHaveBeenCalledWith({
			rtVer: '7',
			requireGuardSnippet: REQUIRE_GUARD_SNIPPET,
			vendorExports: new Set(['ref', 'createApp']),
		});
	});

	it('prefers the explicit /ns/rt/<ver> path segment over the graph version', async () => {
		const handler = mountRoute(7);
		await handler({ url: '/ns/rt/42' }, makeRes(), vi.fn());
		expect(buildNsRtBridgeModule.mock.calls[0][0]).toMatchObject({ rtVer: '42' });
	});

	it('responds 500 with a valid empty module if the builder throws', async () => {
		buildNsRtBridgeModule.mockImplementationOnce(() => {
			throw new Error('boom');
		});
		const handler = mountRoute();
		const res = makeRes();
		await handler({ url: '/ns/rt' }, res, vi.fn());
		expect(res.statusCode).toBe(500);
		expect(res.body).toBe('export {}\n');
	});
});
