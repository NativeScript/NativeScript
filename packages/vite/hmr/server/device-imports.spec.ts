import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { restoreOriginETags, rewriteDeviceImports, rewriteDeviceImportsInResponse } from './device-imports.js';

const ORIGIN = 'http://192.168.1.2:5173';

describe('rewriteDeviceImports', () => {
	it('prefixes the origin to root-relative literal dynamic imports, keeping quotes and query', () => {
		const code = `const a = () => import('/src/lazy.ts?t=1700000000000');\nconst b = () => import("/@fs/repo/x.js");\n`;
		expect(rewriteDeviceImports(code, `${ORIGIN}/`)).toBe(`const a = () => import('${ORIGIN}/src/lazy.ts?t=1700000000000');\nconst b = () => import("${ORIGIN}/@fs/repo/x.js");\n`);
	});

	it('leaves static imports, non-literal, relative, protocol-relative and absolute specifiers alone', () => {
		const code = `import { a } from "/src/a.ts";\nexport * from '/src/b.ts';\nimport('./rel.js');\nimport('//cdn/x.js');\nimport('https://cdn/x.js');\nimport(name);\nimport(__vite__injectQuery(u, 'import'));\nconst u = import.meta.url;`;
		expect(rewriteDeviceImports(code, ORIGIN)).toBe(code);
	});

	it('restores runtime builtins Vite serves under /@id/, static and dynamic', () => {
		const code = `import * as m from "/@id/ns:module";\nexport { x } from '/@id/ns:util';\nconst h = () => import('/@id/ns:module');\nimport "/@id/__x00__virtual:ns-dev-boot";\nimport "/@id/some-bare";\n`;
		expect(rewriteDeviceImports(code, ORIGIN)).toBe(`import * as m from "ns:module";\nexport { x } from 'ns:util';\nconst h = () => import('ns:module');\nimport "/@id/__x00__virtual:ns-dev-boot";\nimport "/@id/some-bare";\n`);
	});

	it('handles minified code and returns unparsable code unchanged', () => {
		expect(rewriteDeviceImports(`x=()=>import("/src/a.js"),y=()=>import("/src/b.js")`, ORIGIN)).toBe(`x=()=>import("${ORIGIN}/src/a.js"),y=()=>import("${ORIGIN}/src/b.js")`);
		const broken = `import('/src/a.js'); export {`;
		expect(rewriteDeviceImports(broken, ORIGIN)).toBe(broken);
	});
});

class FakeResponse extends EventEmitter {
	statusCode = 200;
	headersSent = false;
	headers: Record<string, unknown> = {};
	body: Buffer[] = [];
	setHeader(name: string, value: unknown) {
		this.headers[name.toLowerCase()] = value;
	}
	getHeader(name: string) {
		return this.headers[name.toLowerCase()];
	}
	hasHeader(name: string) {
		return name.toLowerCase() in this.headers;
	}
	write(chunk: unknown) {
		this.body.push(Buffer.from(chunk as string));
		return true;
	}
	end(chunk?: unknown) {
		if (chunk != null && typeof chunk !== 'function') this.body.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
		return this;
	}
	text() {
		return Buffer.concat(this.body).toString('utf8');
	}
}

function respond(method: string, status: number, contentType: string | undefined, send: (res: FakeResponse) => void) {
	const res = new FakeResponse();
	rewriteDeviceImportsInResponse({ method } as any, res as any, () => ORIGIN);
	res.statusCode = status;
	if (contentType) res.setHeader('Content-Type', contentType);
	send(res);
	return res;
}

describe('rewriteDeviceImportsInResponse', () => {
	const module = `export const load = () => import('/src/lazy.ts');`;

	it('rewrites a 2xx JavaScript body and fixes a set Content-Length', () => {
		const res = respond('GET', 200, 'text/javascript', (r) => {
			r.setHeader('Content-Length', Buffer.byteLength(module));
			r.end(module);
		});
		expect(res.text()).toBe(`export const load = () => import('${ORIGIN}/src/lazy.ts');`);
		expect(res.getHeader('content-length')).toBe(Buffer.byteLength(res.text()));
	});

	it('collects written chunks before rewriting', () => {
		const res = respond('GET', 200, 'application/javascript; charset=utf-8', (r) => {
			r.write(module.slice(0, 30));
			r.write(module.slice(30));
			r.end();
		});
		expect(res.text()).toContain(`import('${ORIGIN}/src/lazy.ts')`);
		expect(res.hasHeader('content-length')).toBe(false);
	});

	it('ties the ETag to the origin and drops immutable when the origin is written into the body', () => {
		const res = respond('GET', 200, 'text/javascript', (r) => {
			r.setHeader('ETag', 'W/"2a-abc"');
			r.setHeader('Cache-Control', 'max-age=31536000,immutable');
			r.end(module);
		});
		expect(res.getHeader('etag')).toMatch(/^W\/"2a-abc-o[0-9a-f]{8}"$/);
		expect(res.getHeader('cache-control')).toBe('no-cache');
	});

	it("keeps Vite's ETag and caching when the body has no origin-dependent rewrite", () => {
		const builtinOnly = `import { createRequire } from "/@id/ns:module";`;
		const res = respond('GET', 200, 'text/javascript', (r) => {
			r.setHeader('ETag', 'W/"2a-abc"');
			r.setHeader('Cache-Control', 'max-age=31536000,immutable');
			r.end(builtinOnly);
		});
		expect(res.text()).toBe(`import { createRequire } from "ns:module";`);
		expect(res.getHeader('etag')).toBe('W/"2a-abc"');
		expect(res.getHeader('cache-control')).toBe('max-age=31536000,immutable');
	});

	it('maps validators issued for the current origin back to Vite ETags, leaving other origins unmatched', () => {
		const issued = respond('GET', 200, 'text/javascript', (r) => {
			r.setHeader('ETag', 'W/"2a-abc"');
			r.end(module);
		}).getHeader('etag') as string;
		expect(restoreOriginETags(issued, ORIGIN)).toBe('W/"2a-abc"');
		expect(restoreOriginETags(`W/"1-x", ${issued}`, ORIGIN)).toBe('W/"1-x", W/"2a-abc"');
		expect(restoreOriginETags(issued, 'http://10.0.0.9:5173')).toBe(issued);

		const req = { method: 'GET', headers: { 'if-none-match': issued } } as any;
		rewriteDeviceImportsInResponse(req, new FakeResponse() as any, () => ORIGIN);
		expect(req.headers['if-none-match']).toBe('W/"2a-abc"');
	});

	it('passes through other content types, statuses, HEAD requests and empty bodies', () => {
		expect(respond('GET', 200, 'text/css', (r) => r.end(module)).text()).toBe(module);
		expect(respond('GET', 404, 'text/javascript', (r) => r.end(module)).text()).toBe(module);
		expect(respond('HEAD', 200, 'text/javascript', (r) => r.end()).text()).toBe('');
		expect(respond('GET', 200, 'text/javascript', (r) => r.end()).text()).toBe('');
		expect(respond('GET', 304, undefined, (r) => r.end()).text()).toBe('');
	});
});
