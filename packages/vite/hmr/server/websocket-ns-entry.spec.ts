import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerNsEntryRoutes, type RegisterNsEntryRoutesOptions } from './websocket-ns-entry.js';
import * as serverOriginModule from './server-origin.js';

let originSpy: ReturnType<typeof vi.spyOn>;

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
 * Registers the bootstrap routes against a fake connect server and returns its
 * two middlewares (in order: `/ns/entry-rt`, then `/ns/entry`) plus the spies.
 */
function mount(overrides: Partial<RegisterNsEntryRoutesOptions> = {}) {
	const handlers: Handler[] = [];
	const server = { middlewares: { use: (fn: Handler) => handlers.push(fn) } } as any;
	const options: RegisterNsEntryRoutesOptions = {
		verbose: false,
		appRootDir: 'app',
		defaultMainEntry: 'app/app.ts',
		defaultMainEntryVirtual: '/app/app.ts',
		getGraphVersion: () => 7,
		...overrides,
	};
	registerNsEntryRoutes(server, options);
	expect(handlers).toHaveLength(2);
	const [entryRt, entry] = handlers;
	return { entryRt, entry, getServerOrigin: originSpy };
}

describe('registerNsEntryRoutes', () => {
	// The route module imports getServerOrigin directly now; spy via the module
	// (the proven ESM seam — see server-origin-platform.spec.ts) so the wrapper
	// bakes a deterministic origin instead of a real platform lookup.
	beforeEach(() => {
		originSpy = vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
	});
	afterEach(() => {
		originSpy.mockRestore();
	});

	it('registers exactly two middlewares', () => {
		mount();
	});

	describe('GET /ns/entry-rt', () => {
		it('passes through unrelated paths', async () => {
			const { entryRt } = mount();
			const next = vi.fn();
			const res = makeRes();
			await entryRt({ url: '/ns/entry', socket: {} }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.ended).toBe(false);
		});

		it('serves a non-empty JS module (built .js, .ts fallback, or stub)', async () => {
			const { entryRt } = mount();
			const next = vi.fn();
			const res = makeRes();
			await entryRt({ url: '/ns/entry-rt', socket: {} }, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.statusCode).toBe(200);
			expect(String(res.headers['Content-Type'])).toContain('javascript');
			expect((res.body || '').length).toBeGreaterThan(0);
		});
	});

	describe('GET /ns/entry', () => {
		it('passes through unrelated paths', async () => {
			const { entry } = mount();
			const next = vi.fn();
			const res = makeRes();
			await entry({ url: '/ns/entry-rt', socket: {} }, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.ended).toBe(false);
		});

		it('emits a wrapper using the injected origin + graph version', async () => {
			const { entry, getServerOrigin } = mount();
			const next = vi.fn();
			const res = makeRes();
			await entry({ url: '/ns/entry', socket: {} }, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.statusCode).toBe(200);
			const body = res.body || '';
			expect(getServerOrigin).toHaveBeenCalled();
			// Version falls back to getGraphVersion() === 7 when no segment is given.
			expect(body).toContain('[ns-entry][v7]');
			expect(body).toContain("'/ns/entry-rt?v=' + String(__ns_graph_ver)");
			expect(body).toContain('http://test:5173');
			expect(body).toContain('//# sourceURL=http://test:5173/ns/entry');
		});

		it('uses an explicit version segment (/ns/entry/<ver>) verbatim', async () => {
			const { entry } = mount();
			const next = vi.fn();
			const res = makeRes();
			await entry({ url: '/ns/entry/42', socket: {} }, res, next);
			expect(res.statusCode).toBe(200);
			const body = res.body || '';
			expect(body).toContain('[ns-entry][v42]');
			expect(body).toContain('"42"');
		});
	});
});
