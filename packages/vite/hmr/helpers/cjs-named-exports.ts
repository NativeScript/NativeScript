// Runtime-enumerated CommonJS named exports for the HMR `/ns/m` pipeline.
//
// Why this exists:
// V8's HTTP-imported ES module loader (the device's `http-esm` mode) requires
// named exports to be declared statically at parse time. Many real-world npm
// packages do not declare their public surface statically — the canonical
// example is lodash:
//
//   (freeModule.exports = _)._ = _;
//
// At parse time there are zero `exports.foo = ...` or
// `Object.defineProperty(exports, 'foo', ...)` patterns. Lodash builds its
// public surface dynamically inside an IIFE and attaches every method to a
// function object that is then assigned to `module.exports`. Neither a
// regex nor an AST can statically determine that lodash exposes
// `capitalize`, `chunk`, `debounce`, etc.
//
// The only correct way to enumerate this kind of CJS module's public
// surface is to actually load it in the dev server's Node context and ask
// `Object.keys(...)`. This is exactly what esbuild and Vite do at build
// time when they pre-bundle CJS deps for an ESM consumer; this helper
// brings the same strategy to the HMR served-module pipeline so that
// `import { capitalize } from 'lodash'` succeeds even when lodash is not
// pre-bundled by Vite.
//
// Safety:
// - Only call this for modules under `node_modules` (we never execute user
//   source code via this path).
// - Wrap in try/catch — some npm packages throw at load time (missing peer
//   deps, browser-only globals, side effects). On any failure we return an
//   empty list and the caller falls back to whatever it could detect
//   statically.
// - Cache by absolute path so a second HMR request for the same module is
//   free.

import { createRequire } from 'node:module';
import * as path from 'node:path';
import * as fs from 'node:fs';

const cache = new Map<string, string[] | null>();

const RESERVED = new Set(['default', '__esModule']);

// `Object.getOwnPropertyNames` on a function exposes these implementation
// details — they are not real exports.
const FUNCTION_INTERNAL = new Set(['length', 'name', 'prototype', 'arguments', 'caller']);

const VALID_IDENT = /^[A-Za-z_$][\w$]*$/;

export function clearCjsNamedExportsCache(filePath?: string): void {
	if (!filePath) {
		cache.clear();
	} else {
		cache.delete(filePath);
	}
}

export function getCjsNamedExportsCacheSize(): number {
	return cache.size;
}

/**
 * Normalize a path that may have come from a Vite-resolved id (e.g.
 * `/@fs/Users/.../node_modules/foo/index.js?import`) into a plain
 * absolute filesystem path that `createRequire` can load.
 *
 * Returns null if the path does not look like an absolute filesystem
 * path that exists on disk.
 */
export function normalizeAbsolutePathForRequire(input: string | null | undefined): string | null {
	if (!input) return null;
	let s = String(input).replace(/[?#].*$/, '');
	// Vite serves absolute paths as `/@fs/<absolute>`; strip the prefix.
	if (s.startsWith('/@fs/')) {
		s = s.slice('/@fs'.length);
	}
	if (!path.isAbsolute(s)) return null;
	try {
		if (!fs.statSync(s).isFile()) return null;
	} catch {
		return null;
	}
	return s;
}

/**
 * Enumerate the named exports of a CommonJS module by loading it in the
 * dev server's Node context.
 *
 * Returns an empty array if the module can't be loaded, isn't in
 * node_modules, or doesn't expose any enumerable string-keyed properties
 * that look like JS identifiers.
 *
 * Results are cached by absolute path. Pass `clearCjsNamedExportsCache()`
 * if you need to invalidate (e.g. between tests).
 */
export function getCjsNamedExports(absolutePath: string | null | undefined): string[] {
	const normalized = normalizeAbsolutePathForRequire(absolutePath);
	if (!normalized) return [];

	// Only enumerate node_modules paths — never execute user source via this code path.
	if (!/(?:^|\/)node_modules\//.test(normalized)) return [];

	const cached = cache.get(normalized);
	if (cached !== undefined) return cached || [];

	let names: string[] | null = null;
	try {
		// `createRequire` needs a path that itself exists; the file we are
		// enumerating is a fine anchor. The cwd of the require base is its
		// parent directory, which matters for nested workspace resolution.
		const req = createRequire(normalized);
		const mod = req(normalized);

		const collected = new Set<string>();
		const isFn = typeof mod === 'function';

		if (mod && (typeof mod === 'object' || isFn)) {
			// `Object.keys` returns enumerable own props — covers most CJS modules
			// where named exports are real properties on the exports object.
			try {
				for (const k of Object.keys(mod)) {
					if (!RESERVED.has(k) && VALID_IDENT.test(k)) collected.add(k);
				}
			} catch {
				/* exotic proxy etc. */
			}
			// `Object.getOwnPropertyNames` covers non-enumerable own props too.
			// Lodash attaches a few methods that aren't enumerable; more importantly
			// some packages mark exports non-enumerable on purpose.
			try {
				for (const k of Object.getOwnPropertyNames(mod)) {
					if (RESERVED.has(k) || !VALID_IDENT.test(k)) continue;
					if (isFn && FUNCTION_INTERNAL.has(k)) continue;
					collected.add(k);
				}
			} catch {
				/* exotic */
			}
			names = Array.from(collected);
		} else {
			// Primitive default export (e.g. `module.exports = 'hello'`). No named exports possible.
			names = [];
		}
	} catch {
		names = null;
	}

	cache.set(normalized, names);
	return names || [];
}
