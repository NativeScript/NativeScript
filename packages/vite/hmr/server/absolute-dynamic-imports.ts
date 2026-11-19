import type { IncomingMessage, ServerResponse } from 'node:http';
import { initSync, parse } from 'es-module-lexer';

/**
 * Prefixes `origin` to every dynamic `import('/…')` whose specifier is a
 * root-relative string literal, query untouched. Static imports stay
 * root-relative.
 *
 * NativeScript runtimes resolve a dynamic `import()` of a non-`http(s)`
 * specifier on the filesystem and strip its query, so the device can only
 * follow absolute URLs there.
 */
export function absolutizeDynamicImports(code: string, origin: string): string {
	if (!code.includes('import(') && !code.includes('import (')) return code;
	initSync();
	let imports: ReturnType<typeof parse>[0];
	try {
		[imports] = parse(code);
	} catch {
		return code;
	}
	const base = origin.replace(/\/+$/, '');
	let out = '';
	let last = 0;
	for (const imp of imports) {
		if (imp.d < 0 || !imp.n || !imp.n.startsWith('/') || imp.n.startsWith('//')) continue;
		const quote = code[imp.s];
		if (quote !== '"' && quote !== "'") continue;
		const start = imp.s + 1;
		if (code[start] !== '/') continue;
		out += code.slice(last, start) + base;
		last = start;
	}
	return last === 0 ? code : out + code.slice(last);
}

const jsContentTypeRE = /\bjavascript\b/i;

function isRewritableResponse(req: IncomingMessage, res: ServerResponse): boolean {
	if (req.method !== 'GET' || res.headersSent) return false;
	if (res.statusCode < 200 || res.statusCode >= 300) return false;
	return jsContentTypeRE.test(String(res.getHeader('content-type') ?? ''));
}

function toBuffer(chunk: unknown, encoding: unknown): Buffer {
	if (Buffer.isBuffer(chunk)) return chunk;
	if (chunk instanceof Uint8Array) return Buffer.from(chunk);
	return Buffer.from(String(chunk), typeof encoding === 'string' ? (encoding as BufferEncoding) : 'utf8');
}

/**
 * Applies {@link absolutizeDynamicImports} to the body of a 2xx JavaScript
 * response, whichever middleware answers it. Rewriting the response rather
 * than the transform result keeps Vite's own specifiers intact: its soft
 * invalidation re-stamps `?t=` only on specifiers equal to an imported
 * module's root-relative URL.
 */
export function absolutizeDynamicImportsInResponse(req: IncomingMessage, res: ServerResponse, getOrigin: () => string): void {
	const write = res.write;
	const end = res.end;
	// undefined: undecided until the first write/end, when status and headers are final.
	let chunks: Buffer[] | null | undefined;
	const buffer = () => {
		if (chunks === undefined) chunks = isRewritableResponse(req, res) ? [] : null;
		return chunks;
	};

	res.write = function (this: ServerResponse, chunk: unknown, encoding?: unknown, callback?: unknown) {
		const target = buffer();
		if (!target) return (write as Function).apply(this, arguments);
		if (chunk != null) target.push(toBuffer(chunk, encoding));
		const done = typeof encoding === 'function' ? encoding : callback;
		if (typeof done === 'function') process.nextTick(done as () => void);
		return true;
	} as ServerResponse['write'];

	res.end = function (this: ServerResponse, chunk?: unknown, encoding?: unknown, callback?: unknown) {
		const target = buffer();
		if (!target) return (end as Function).apply(this, arguments);
		if (chunk != null && typeof chunk !== 'function') target.push(toBuffer(chunk, encoding));
		const done = [chunk, encoding, callback].find((arg) => typeof arg === 'function');
		const original = Buffer.concat(target);
		let body = original;
		if (original.length) {
			const code = original.toString('utf8');
			const rewritten = absolutizeDynamicImports(code, getOrigin());
			if (rewritten !== code) body = Buffer.from(rewritten, 'utf8');
		}
		// The ETag stays Vite's: for one server origin the rewrite is a pure function of the body.
		if (body !== original && this.hasHeader('content-length')) this.setHeader('Content-Length', body.length);
		return (end as Function).call(this, body, done);
	} as ServerResponse['end'];
}
