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
	const entry = safeResolve(rootRequire, packageId);
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
	// Bare specifier — resolve via the calling file's require to honor
	// nested node_modules layouts (e.g. `@vue/runtime-core` from inside
	// `nativescript-vue`).
	if (localRequire) {
		const r = safeResolve(localRequire, spec);
		if (r) return r;
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
