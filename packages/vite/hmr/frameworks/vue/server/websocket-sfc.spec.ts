import { describe, expect, it, vi } from 'vitest';

import { registerSfcHandlers, type RegisterSfcHandlersOptions } from './websocket-sfc.js';

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

type Handler = (req: any, res: any, next: any) => unknown;

/**
 * Registers the SFC handlers against a fake connect server and returns the three
 * middlewares (in registration order: /ns/sfc, /ns/sfc-meta, /ns/asm) plus the
 * transformRequest mock so tests can drive each handler directly.
 */
function mount(overrides: Partial<RegisterSfcHandlersOptions> = {}) {
	const handlers: Handler[] = [];
	const transformRequest = vi.fn(async (_id: string) => null as { code: string } | null);
	const server = {
		middlewares: { use: (fn: Handler) => handlers.push(fn) },
		transformRequest,
		config: { root: '/project' },
	} as any;
	const options: RegisterSfcHandlersOptions = {
		verbose: false,
		appVirtualWithSlash: '/app/',
		sfcFileMap: new Map(),
		depFileMap: new Map(),
		getStrategy: () => ({}) as any,
		...overrides,
	};
	registerSfcHandlers(server, options);
	expect(handlers).toHaveLength(3);
	const [sfc, sfcMeta, asm] = handlers;
	return { sfc, sfcMeta, asm, transformRequest };
}

describe('registerSfcHandlers', () => {
	it('registers exactly three middlewares', () => {
		mount();
	});

	describe('/ns/sfc', () => {
		it('passes through non-SFC paths (and /ns/asm, /ns/sfc-meta)', async () => {
			const { sfc } = mount();
			for (const url of ['/ns/m/src/app.ts', '/ns/asm?path=/a.vue', '/ns/sfc-meta?path=/a.vue']) {
				const next = vi.fn();
				await sfc({ url }, makeRes(), next);
				expect(next).toHaveBeenCalledTimes(1);
			}
		});

		it('returns an empty module when no path is supplied', async () => {
			const { sfc } = mount();
			const res = makeRes();
			await sfc({ url: '/ns/sfc' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toBe('export {}\n');
		});

		it('delegates a full SFC to the canonical (unversioned) /ns/asm assembler URL', async () => {
			const { sfc, transformRequest } = mount();
			transformRequest.mockResolvedValue({ code: 'export default {}' });
			const res = makeRes();
			await sfc({ url: '/ns/sfc?path=/src/App.vue' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain('kind=full (delegated to assembler) path=/src/App.vue');
			// The delegation body is stable across saves; freshness comes from
			// the client evicting the assembler URL, not from a version segment.
			expect(res.body).toContain('export * from "/ns/asm?path=%2Fsrc%2FApp.vue";');
			expect(res.body).toContain('export { default } from "/ns/asm?path=%2Fsrc%2FApp.vue";');
		});

		it('returns an empty module for style variants', async () => {
			const { sfc, transformRequest } = mount();
			transformRequest.mockResolvedValue({ code: '/* css */' });
			const res = makeRes();
			await sfc({ url: '/ns/sfc?path=' + encodeURIComponent('/src/App.vue?vue&type=style') }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain('kind=variant:style');
			expect(res.body).toContain('export {}');
		});
	});

	describe('/ns/sfc-meta', () => {
		it('passes through non-matching paths', async () => {
			const { sfcMeta } = mount();
			const next = vi.fn();
			await sfcMeta({ url: '/ns/sfc?path=/a.vue' }, makeRes(), next);
			expect(next).toHaveBeenCalledTimes(1);
		});

		it('returns 400 when no path is supplied', async () => {
			const { sfcMeta } = mount();
			const res = makeRes();
			await sfcMeta({ url: '/ns/sfc-meta' }, res, vi.fn());
			expect(res.statusCode).toBe(400);
			expect(JSON.parse(res.body!)).toEqual({ error: 'missing path' });
		});

		it('reports script/template presence and render detection', async () => {
			const { sfcMeta, transformRequest } = mount();
			transformRequest.mockImplementation(async (id: string) => {
				if (id.includes('type=template')) return { code: 'export function render(_ctx, _cache) {}' };
				if (id.includes('type=script')) return { code: 'export default { name: "App" }' };
				return null;
			});
			const res = makeRes();
			await sfcMeta({ url: '/ns/sfc-meta?path=/src/App.vue' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.headers['Content-Type']).toBe('application/json; charset=utf-8');
			const payload = JSON.parse(res.body!);
			expect(payload.path).toBe('/src/App.vue');
			expect(payload.hasScript).toBe(true);
			expect(payload.hasTemplate).toBe(true);
			expect(payload.templateHasRender).toBe(true);
			expect(payload.hmrId).toMatch(/^[0-9a-f]{8}$/);
		});
	});

	describe('/ns/asm', () => {
		it('passes through non-matching paths', async () => {
			const { asm } = mount();
			const next = vi.fn();
			await asm({ url: '/ns/sfc?path=/a.vue' }, makeRes(), next);
			expect(next).toHaveBeenCalledTimes(1);
		});

		it('returns 400 when no path is supplied', async () => {
			const { asm } = mount();
			const res = makeRes();
			await asm({ url: '/ns/asm' }, res, vi.fn());
			expect(res.statusCode).toBe(400);
			expect(res.body).toBe('export {}\n');
		});

		it('serves a deterministic diagnostic stub for ?diag=1', async () => {
			const { asm, transformRequest } = mount();
			const res = makeRes();
			await asm({ url: '/ns/asm?path=/src/App.vue&diag=1' }, res, vi.fn());
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain('// [sfc-asm] /src/App.vue (diag)');
			expect(res.body).toContain("_createElementVNode('StackLayout')");
			expect(res.body).toContain('export default __ns_sfc__;');
			// diag path is self-contained: no transform needed
			expect(transformRequest).not.toHaveBeenCalled();
		});

		it('expands "@/" specifiers via appVirtualWithSlash', async () => {
			const { asm } = mount({ appVirtualWithSlash: '/app/' });
			const res = makeRes();
			await asm({ url: '/ns/asm?path=' + encodeURIComponent('@/App.vue') + '&diag=1' }, res, vi.fn());
			expect(res.body).toContain('// [sfc-asm] /app/App.vue (diag)');
		});
	});
});
