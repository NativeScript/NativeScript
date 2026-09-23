import { describe, expect, it, vi } from 'vitest';
import { builtinModules } from 'node:module';

import { buildNodeBuiltinShimModule, getNodeBuiltinImportMapEntries, registerNodeBuiltinsRoute } from './node-builtins-route.js';

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

function mountRoute() {
	let handler: ((req: any, res: any, next: any) => unknown) | undefined;
	const server = { middlewares: { use: (fn: typeof handler) => (handler = fn) } } as any;
	registerNodeBuiltinsRoute(server);
	if (!handler) throw new Error('route did not register a middleware');
	return handler;
}

describe('getNodeBuiltinImportMapEntries', () => {
	it('maps every node: builtin to an exact /ns/node/ URL on the given origin', () => {
		const entries = getNodeBuiltinImportMapEntries('http://192.168.1.5:5173');

		expect(entries['node:url']).toBe('http://192.168.1.5:5173/ns/node/url');
		expect(entries['node:path']).toBe('http://192.168.1.5:5173/ns/node/path');
		// Nested builtin names (fs/promises) must be covered too.
		expect(entries['node:fs/promises']).toBe('http://192.168.1.5:5173/ns/node/fs/promises');

		// EXACT entries only — no trailing-slash prefix keys. The native
		// resolver only intercepts `node:`-prefixed specifiers, and bare
		// names ('url', 'path') must keep resolving to same-named npm
		// packages via the normal discovery entries.
		for (const key of Object.keys(entries)) {
			expect(key.startsWith('node:')).toBe(true);
			expect(key.endsWith('/')).toBe(false);
		}

		// Vocabulary is Node's own builtin list — nothing hand-maintained.
		const unprefixed = builtinModules.filter((name) => !name.startsWith('node:'));
		expect(Object.keys(entries).length).toBe(new Set(unprefixed).size);
	});
});

describe('buildNodeBuiltinShimModule', () => {
	it('serves a real shim for node:url with the fileURLToPath/pathToFileURL pair', () => {
		const body = buildNodeBuiltinShimModule('url');
		expect(body).toContain('export function fileURLToPath');
		expect(body).toContain('export function pathToFileURL');
		// The runtime's global URL/URLSearchParams are re-exported so
		// `import { URL } from 'node:url'` matches Node semantics.
		expect(body).toContain('_URL as URL');
		expect(body).toContain('_URLSearchParams as URLSearchParams');
		expect(body).toContain('export default');
	});

	it('serves a warn-stub default export for every other builtin', () => {
		const body = buildNodeBuiltinShimModule('fs');
		expect(body).toContain('console.warn');
		expect(body).toContain('"node:fs"');
		expect(body).toContain('export default {};');
	});
});

describe('registerNodeBuiltinsRoute', () => {
	it('passes through non-/ns/node/ requests without responding', () => {
		const handler = mountRoute();
		const res = makeRes();
		const next = vi.fn();
		handler({ url: '/ns/m/src/app.ts' }, res, next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.body).toBeUndefined();
	});

	it('serves the url shim with device-module headers', () => {
		const handler = mountRoute();
		const res = makeRes();
		const next = vi.fn();
		handler({ url: '/ns/node/url' }, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.headers['Content-Type']).toBe('application/javascript; charset=utf-8');
		expect(res.headers['Cache-Control']).toContain('no-store');
		expect(res.body).toContain('export function fileURLToPath');
	});

	it('serves warn-stubs for other real builtins, including nested names', () => {
		const handler = mountRoute();
		const res = makeRes();
		handler({ url: '/ns/node/fs/promises' }, res, vi.fn());
		expect(res.statusCode).toBe(200);
		expect(res.body).toContain('"node:fs/promises"');
		expect(res.body).toContain('export default {};');
	});

	it('responds 404 for names that are not Node builtins', () => {
		const handler = mountRoute();
		const res = makeRes();
		handler({ url: '/ns/node/not-a-builtin' }, res, vi.fn());
		expect(res.statusCode).toBe(404);
		expect(res.body).toContain('not-a-builtin');
	});
});
