// Static export-surface enumerator for the single-realm HTTP-ESM bridge.
//
// The HMR runtime serves canonical bridge specifiers (e.g. `/ns/rt` for
// `nativescript-vue`) that fan out to the device's vendor registry so that
// app code, plugins, and the vendor bundle itself share one module record
// per package. The bridge module must therefore re-export every public
// symbol the underlying package offers — otherwise consumers fall back to
// `undefined` for any export the bridge author forgot to enumerate, and the
// failure only surfaces at the call site (often deep inside a UI event
// handler) as `TypeError: <name> is not a function`.
//
// Hand-curated re-export lists are the source of that bug class. This
// helper replaces them with a deterministic walk of the package's static
// ESM export graph:
//
//   1. Resolve the package's `main` entry from the project's `node_modules`.
//   2. Parse with Babel and collect every named export — both inline
//      (`export const x = …`, `export function y() {}`, `export { z }`) and
//      re-exported (`export { a, b as c } from './foo'`).
//   3. Recurse into `export * from <spec>`, following both relative paths
//      and bare package specifiers (so `export * from '@vue/runtime-core'`
//      contributes the full Vue runtime API too).
//   4. Cache the result by `${projectRoot}::${packageId}` — the walk
//      touches dozens of files for `nativescript-vue` and we want one walk
//      per dev session, not per request.
//
// The walker is intentionally permissive: parse errors and unresolvable
// specifiers are swallowed (continue with what we have). The caller decides
// what to do if the surface comes back empty (typically: fall back to a
// known-good baseline list rather than emit a stub bridge).

import { parse as babelParse } from '@babel/parser';
import { readFileSync, existsSync, realpathSync } from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import type { Program, Statement } from '@babel/types';

export interface PackageExportShape {
	/** Union of every named export reachable from the package entry, minus `default`. */
	names: Set<string>;
	/** True if any visited file emits a `default` export. */
	hasDefault: boolean;
	/** Absolute path to the resolved entry file (empty string when the package could not be resolved). */
	entry: string;
	/** Files visited during the walk — useful for diagnostics and cache invalidation. */
	visitedFiles: string[];
}

const cache = new Map<string, PackageExportShape>();

/**
 * Clear the cache. Tests use this to assert determinism; production code
 * never needs it (the cache is intentionally process-lifetime).
 */
export function __clearPackageExportsCache(): void {
	cache.clear();
}

export function enumeratePackageExports(packageId: string, projectRoot: string): PackageExportShape {
	const root = path.resolve(projectRoot || process.cwd());
	const cacheKey = `${root}::${packageId}`;
	const cached = cache.get(cacheKey);
	if (cached) return cached;

	const result: PackageExportShape = {
		names: new Set<string>(),
		hasDefault: false,
		entry: '',
		visitedFiles: [],
	};

	const rootRequire = createRequireFromDir(root);
	const entry = resolvePackageEsmEntry(packageId, rootRequire);
	if (!entry) {
		cache.set(cacheKey, result);
		return result;
	}
	result.entry = entry;

	const visited = new Set<string>();
	const queue: string[] = [entry];

	while (queue.length) {
		const file = queue.shift()!;
		const real = safeRealpath(file);
		if (visited.has(real)) continue;
		visited.add(real);
		result.visitedFiles.push(real);

		const source = readFileSafe(real);
		if (source === null) continue;

		const program = parseModule(source);
		if (!program) continue;

		const dir = path.dirname(real);
		const localRequire = createRequireFromFile(real);

		for (const node of program.body as Statement[]) {
			collectExportsFromNode(node, result, (spec) => {
				const next = resolveSpec(spec, dir, localRequire);
				if (next) queue.push(next);
			});
		}
	}

	cache.set(cacheKey, result);
	return result;
}

function collectExportsFromNode(node: Statement, out: PackageExportShape, queueReExportSource: (spec: string) => void): void {
	if (node.type === 'ExportNamedDeclaration') {
		// `export const x = …`, `export function y() {}`, `export class Z {}`
		const decl: any = (node as any).declaration;
		if (decl) {
			if (decl.declarations) {
				for (const d of decl.declarations) {
					addId(out.names, d?.id);
				}
			} else if (decl.id?.name) {
				out.names.add(decl.id.name);
			}
		}
		// `export { a, b as c }` and `export { a } from './foo'`
		for (const spec of ((node as any).specifiers || []) as any[]) {
			const exportedName = spec?.exported?.name ?? spec?.exported?.value;
			if (exportedName === 'default') {
				out.hasDefault = true;
			} else if (exportedName) {
				out.names.add(String(exportedName));
			}
		}
		// `export … from <source>` — we already captured the explicit names above,
		// but we still need to recurse if there's a `*` re-export hiding inside
		// (Babel models that as `ExportAllDeclaration`, handled below). Nothing to do here.
	} else if (node.type === 'ExportAllDeclaration') {
		// `export * from <source>` — recurse.
		// `export * as ns from <source>` adds a named binding `ns` instead of fanning out.
		const src = (node as any).source?.value as string | undefined;
		const asName = ((node as any).exported as any)?.name;
		if (asName) {
			if (asName !== 'default') out.names.add(String(asName));
		} else if (src) {
			queueReExportSource(src);
		}
	} else if (node.type === 'ExportDefaultDeclaration') {
		out.hasDefault = true;
	}
}

function addId(names: Set<string>, idNode: any): void {
	if (!idNode) return;
	if (idNode.type === 'Identifier' && idNode.name) {
		names.add(idNode.name);
		return;
	}
	if (idNode.type === 'ObjectPattern') {
		for (const prop of idNode.properties || []) {
			if (prop.type === 'ObjectProperty') addId(names, prop.value);
			else if (prop.type === 'RestElement') addId(names, prop.argument);
		}
		return;
	}
	if (idNode.type === 'ArrayPattern') {
		for (const el of idNode.elements || []) addId(names, el);
		return;
	}
	if (idNode.type === 'AssignmentPattern') {
		addId(names, idNode.left);
	}
}

function parseModule(source: string): Program | null {
	try {
		const ast = babelParse(source, {
			sourceType: 'module',
			plugins: ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'decorators-legacy', 'classProperties', 'classPrivateProperties', 'classPrivateMethods'] as any,
			errorRecovery: true,
			allowReturnOutsideFunction: true,
			allowUndeclaredExports: true,
		});
		return (ast as any).program as Program;
	} catch {
		return null;
	}
}

function resolveSpec(spec: string, dir: string, localRequire: NodeJS.Require | null): string | null {
	if (!spec) return null;
	if (spec.startsWith('.')) {
		return resolveRelative(dir, spec);
	}
	if (spec.startsWith('/')) {
		return existsSync(spec) ? spec : null;
	}
	// Bare specifier (e.g. `@vue/runtime-core` from inside `nativescript-vue`).
	// `createRequire.resolve()` is CJS-first and follows the package's `main`
	// field, which for dual-format packages like `@vue/runtime-core` points at
	// a CommonJS shim (`module.exports = require('./dist/…cjs.js')`) — parsing
	// that as ESM yields zero exports and we silently drop the entire
	// re-export chain. Use the ESM-aware resolver instead so we land on the
	// actual `dist/…esm-bundler.js` advertised by `exports[".module"]` /
	// `module`, where `export { ref, computed, … }` lives.
	if (localRequire) {
		return resolvePackageEsmEntry(spec, localRequire);
	}
	return null;
}

/**
 * Resolve a bare specifier to its ESM entry file by consulting the package's
 * own `package.json` ESM hints — in priority order:
 *
 *   1. `exports[<sub>].module` (Vue, modern dual-format packages)
 *   2. `exports[<sub>].import`
 *   3. `exports[<sub>]` shorthand (string form)
 *   4. top-level `module` field (older dual-format convention)
 *   5. top-level `main` (last resort; may be CJS — we'll parse what we get)
 *
 * `<sub>` is either `"."` (root entry) or `"./relative/subpath"`. Anything not
 * declared in `exports` falls back to plain CJS resolution.
 *
 * Returns the absolute file path, or `null` if the package can't be located.
 */
function resolvePackageEsmEntry(spec: string, localRequire: NodeJS.Require): string | null {
	const { packageName, subpath } = splitBareSpec(spec);
	if (!packageName) return null;

	// Locate the package's `package.json` from the calling file's vantage point.
	// Node ≥ 18.6 has `require.resolve('<pkg>/package.json')` working for almost
	// every layout (including pnpm hoisted/nested), provided the package
	// declares `package.json` reachable (it is, by default). If the package
	// opts out of exposing it via `exports`, fall back to walking up from any
	// resolvable entry.
	let pkgJsonPath = safeResolve(localRequire, `${packageName}/package.json`);
	if (!pkgJsonPath) {
		const someEntry = safeResolve(localRequire, spec);
		if (someEntry) pkgJsonPath = findPackageJsonUpward(someEntry, packageName);
	}
	if (!pkgJsonPath) return null;

	const pkgDir = path.dirname(pkgJsonPath);
	const pkg = readJsonSafe(pkgJsonPath);
	if (!pkg) return null;

	const subKey = subpath ? `./${subpath}` : '.';
	const esmRelative = pickEsmEntryFromManifest(pkg, subKey);
	if (esmRelative) {
		const resolved = resolveRelativeInsidePackage(pkgDir, esmRelative);
		if (resolved) return resolved;
	}

	// Last-resort fallback: ordinary CJS resolution. Parsing may yield zero
	// exports (the file is genuinely CJS) — that's acceptable; the caller
	// treats an empty contribution as "this package adds nothing" rather than
	// erroring out.
	return safeResolve(localRequire, spec);
}

function splitBareSpec(spec: string): { packageName: string; subpath: string } {
	if (spec.startsWith('@')) {
		const parts = spec.split('/');
		if (parts.length < 2) return { packageName: '', subpath: '' };
		return { packageName: `${parts[0]}/${parts[1]}`, subpath: parts.slice(2).join('/') };
	}
	const slash = spec.indexOf('/');
	if (slash === -1) return { packageName: spec, subpath: '' };
	return { packageName: spec.slice(0, slash), subpath: spec.slice(slash + 1) };
}

function readJsonSafe(file: string): any | null {
	try {
		return JSON.parse(readFileSync(file, 'utf-8'));
	} catch {
		return null;
	}
}

function pickEsmEntryFromManifest(pkg: any, subKey: string): string | null {
	const exportsField = pkg?.exports;
	if (exportsField && typeof exportsField === 'object') {
		const entry = exportsField[subKey];
		const fromConditional = pickEsmFromConditionalExports(entry);
		if (fromConditional) return fromConditional;
	}
	// `exports` as a bare string only applies to the `.` subpath.
	if (typeof exportsField === 'string' && subKey === '.') return exportsField;

	if (subKey === '.') {
		if (typeof pkg?.module === 'string') return pkg.module;
		if (typeof pkg?.main === 'string') return pkg.main;
		// CommonJS-only packages frequently omit `main`; Node defaults to `index.js`.
		return 'index.js';
	}
	// Subpath without an `exports` mapping: caller falls through to CJS resolution.
	return null;
}

function pickEsmFromConditionalExports(entry: any): string | null {
	if (!entry) return null;
	if (typeof entry === 'string') return entry;
	if (typeof entry !== 'object') return null;
	// Prefer `module` (the de-facto "ESM bundler" condition that Vue, lit,
	// preact etc. ship), then `import`, then `default`. Skip `node`/`require`
	// because those usually point at the CJS shim we're explicitly avoiding.
	for (const key of ['module', 'import', 'default']) {
		const value = (entry as any)[key];
		if (typeof value === 'string') return value;
		if (value && typeof value === 'object') {
			const nested = pickEsmFromConditionalExports(value);
			if (nested) return nested;
		}
	}
	return null;
}

function resolveRelativeInsidePackage(pkgDir: string, rel: string): string | null {
	const trimmed = rel.replace(/^\.\//, '');
	const candidates = [trimmed, `${trimmed}.js`, `${trimmed}.mjs`, `${trimmed}.cjs`, `${trimmed}/index.js`, `${trimmed}/index.mjs`];
	for (const c of candidates) {
		const p = path.join(pkgDir, c);
		if (existsSync(p)) return safeRealpath(p);
	}
	return null;
}

function findPackageJsonUpward(startFile: string, expectedName: string): string | null {
	let dir = path.dirname(startFile);
	const root = path.parse(dir).root;
	while (dir && dir !== root) {
		const candidate = path.join(dir, 'package.json');
		if (existsSync(candidate)) {
			const pkg = readJsonSafe(candidate);
			if (pkg?.name === expectedName) return candidate;
		}
		const next = path.dirname(dir);
		if (next === dir) break;
		dir = next;
	}
	return null;
}

function resolveRelative(dir: string, spec: string): string | null {
	const base = path.resolve(dir, spec);
	const candidates = ['', '.js', '.mjs', '.cjs', '/index.js', '/index.mjs', '/index.cjs'];
	for (const ext of candidates) {
		const p = base + ext;
		try {
			if (existsSync(p)) {
				const real = safeRealpath(p);
				// Skip directories returned by `existsSync` without an index file fallback.
				try {
					const stat = readFileSafe(real);
					if (stat !== null) return real;
				} catch {}
			}
		} catch {}
	}
	return null;
}

function safeResolve(req: NodeJS.Require, spec: string): string | null {
	try {
		return req.resolve(spec);
	} catch {
		return null;
	}
}

function createRequireFromDir(dir: string): NodeJS.Require {
	// `createRequire` wants a file path; we pass a synthetic file under the
	// dir so resolution starts there.
	return createRequire(path.join(dir, 'package.json'));
}

function createRequireFromFile(file: string): NodeJS.Require | null {
	try {
		return createRequire(file);
	} catch {
		return null;
	}
}

function safeRealpath(file: string): string {
	try {
		return realpathSync(file);
	} catch {
		return file;
	}
}

function readFileSafe(file: string): string | null {
	try {
		return readFileSync(file, 'utf-8');
	} catch {
		return null;
	}
}
