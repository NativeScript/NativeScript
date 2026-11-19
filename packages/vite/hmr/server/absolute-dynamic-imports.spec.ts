import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { absolutizeDynamicImports, absolutizeDynamicImportsInResponse } from './absolute-dynamic-imports.js';

const ORIGIN = 'http://192.168.1.2:5173';

describe('absolutizeDynamicImports', () => {
	it('prefixes the origin to root-relative literal dynamic imports, keeping quotes and query', () => {
		const code = `const a = () => import('/src/lazy.ts?t=1700000000000');\nconst b = () => import("/@fs/repo/x.js");\n`;
		expect(absolutizeDynamicImports(code, `${ORIGIN}/`)).toBe(`const a = () => import('${ORIGIN}/src/lazy.ts?t=1700000000000');\nconst b = () => import("${ORIGIN}/@fs/repo/x.js");\n`);
	});

	it('leaves static imports, non-literal, relative, protocol-relative and absolute specifiers alone', () => {
		const code = `import { a } from "/src/a.ts";\nexport * from '/src/b.ts';\nimport('./rel.js');\nimport('//cdn/x.js');\nimport('https://cdn/x.js');\nimport(name);\nimport(__vite__injectQuery(u, 'import'));\nconst u = import.meta.url;`;
		expect(absolutizeDynamicImports(code, ORIGIN)).toBe(code);
	});

	it('handles minified code and returns unparsable code unchanged', () => {
		expect(absolutizeDynamicImports(`x=()=>import("/src/a.js"),y=()=>import("/src/b.js")`, ORIGIN)).toBe(`x=()=>import("${ORIGIN}/src/a.js"),y=()=>import("${ORIGIN}/src/b.js")`);
		const broken = `import('/src/a.js'); export {`;
		expect(absolutizeDynamicImports(broken, ORIGIN)).toBe(broken);
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
	absolutizeDynamicImportsInResponse({ method } as any, res as any, () => ORIGIN);
	res.statusCode = status;
	if (contentType) res.setHeader('Content-Type', contentType);
	send(res);
	return res;
}

describe('absolutizeDynamicImportsInResponse', () => {
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

	it('passes through other content types, statuses, HEAD requests and empty bodies', () => {
		expect(respond('GET', 200, 'text/css', (r) => r.end(module)).text()).toBe(module);
		expect(respond('GET', 404, 'text/javascript', (r) => r.end(module)).text()).toBe(module);
		expect(respond('HEAD', 200, 'text/javascript', (r) => r.end()).text()).toBe('');
		expect(respond('GET', 200, 'text/javascript', (r) => r.end()).text()).toBe('');
		expect(respond('GET', 304, undefined, (r) => r.end()).text()).toBe('');
	});
});
