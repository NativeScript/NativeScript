import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import * as path from 'node:path';
import type { FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { typescriptServerStrategy } from '../../typescript/server/strategy.js';

// React server strategy for NativeScript HMR.
//
// React renders through DOMiNATIVE via `@nativescript-community/react` and runs
// WITHOUT React Fast Refresh (module-level reload, mirroring the Solid flavor's
// `hot: false`). It therefore needs no framework-specific HMR transform — it
// reuses the generic TypeScript strategy's device-module pipeline verbatim
// (HTTP-loaded modules, vendor bridge, shared graph delta on hot update).
//
// The important part is that this is REGISTERED in `STRATEGY_REGISTRY`: the
// server-side HMR plugin (which installs the `/ns/*` device routes — `/ns/core`,
// `/ns/import-map.json`, `/ns/m`, `/ns/entry-rt`, …) is only added for flavors
// with a registered strategy. Without it, a React project's dev server serves no
// `/ns/*` routes and the app fails at boot fetching `/ns/core/xhr` (404).

// ── React-ecosystem CJS named-export interop (the `transformNodeModule` hook) ──
//
// React and friends ship the classic prod/dev conditional re-export wrapper:
//
//     if (process.env.NODE_ENV === 'production') module.exports = require('./cjs/x.production.js');
//     else module.exports = require('./cjs/x.development.js');
//
// Served raw over `/ns/m`, that wrapper exposes ONLY a default export — the device's
// ESM loader can't see the names (`jsx`, `useSyncExternalStoreWithSelector`, …)
// because they materialize on `module.exports` only at runtime, through the
// conditional require. So a consumer's `import { useSyncExternalStoreWithSelector }`
// (or `{ jsx }` from react/jsx-runtime, etc.) fails with "does not provide an export
// named …". The non-HMR rolldown build bundles these fine; this only affects the
// HMR/dev `/ns/m` path.
//
// The DEVELOPMENT target file is plain CJS (`exports.x = …`), whose named exports
// the `/ns/m` pipeline DOES statically surface. So we rewrite the wrapper to
// re-export EXPLICIT names from its development target. (We can't `export *` — the
// device transform downgrades export-star to a side-effect import — so we read the
// dev file and list the names.) Generic: works for any such wrapper, no per-package
// shim.

const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));

// react/jsx-runtime is the hottest of these (every JSX module imports it). Serve a
// self-contained shim built on React.createElement so it never depends on the
// internals of react's dev jsx-runtime file. (App-code imports are already routed
// here by the resolve alias in configuration/react.ts; this covers vendored
// importers served through `/ns/m`.)
const REACT_JSX_RUNTIME_RE = /(^|[\\/])react[\\/]jsx-(?:dev-)?runtime(?:[\\/.]|$)/;
const REACT_JSX_RUNTIME_SHIM = [
	`import { createElement, Fragment as __NS_Fragment } from 'react';`,
	`export const Fragment = __NS_Fragment;`,
	`function __ns_jsx(type, config, maybeKey) {`,
	`  if (maybeKey !== undefined) return createElement(type, Object.assign({}, config || {}, { key: maybeKey }));`,
	`  return createElement(type, config);`,
	`}`,
	`export function jsx(type, config, maybeKey) { return __ns_jsx(type, config, maybeKey); }`,
	`export function jsxs(type, config, maybeKey) { return __ns_jsx(type, config, maybeKey); }`,
	`export function jsxDEV(type, config, maybeKey) { return __ns_jsx(type, config, maybeKey); }`,
].join('\n');

// Lex `exports.NAME = …` / `Object.defineProperty(exports, "NAME", …)` from a CJS
// development file (the prod/dev targets are plain CJS, statically lexable).
function lexCjsExportNames(filePath: string): string[] {
	let src = '';
	try {
		src = readFileSync(filePath, 'utf8');
	} catch {
		return [];
	}
	const names = new Set<string>();
	for (const m of src.matchAll(/\bexports\.([A-Za-z_$][\w$]*)\s*=/g)) names.add(m[1]);
	for (const m of src.matchAll(/Object\.defineProperty\(\s*exports\s*,\s*['"]([A-Za-z_$][\w$]*)['"]/g)) names.add(m[1]);
	names.delete('default');
	names.delete('__esModule');
	return Array.from(names);
}

// Resolve a wrapper module's development-target relative require (`devRel`) to an
// absolute fs path. `moduleId` is the wrapper's id (an fs path, or a
// `…/node_modules/<pkg>/<sub>` url/id). We find the wrapper's fs path — directly if
// it's already absolute, otherwise by resolving its public package subpath spec —
// then join `devRel` against the wrapper's directory (the dev file is internal, so
// it can't be import-resolved directly under an `exports` map).
function resolveDevTargetPath(moduleId: string, devRel: string): string | null {
	const clean = (moduleId || '').replace(/[?#].*$/, '');
	if (!clean) return null;

	let wrapperPath: string | null = null;
	if (path.isAbsolute(clean) && existsSync(clean)) {
		wrapperPath = clean;
	} else {
		const nm = clean.match(/node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+[\\/].*)$/);
		if (nm) {
			const subpath = nm[1].split(path.sep).join('/');
			for (const spec of [subpath.replace(/\.(?:js|mjs|cjs)$/, ''), subpath]) {
				try {
					wrapperPath = projectRequire.resolve(spec);
					break;
				} catch {}
			}
		}
	}
	if (!wrapperPath) return null;

	const devPath = path.resolve(path.dirname(wrapperPath), devRel);
	return existsSync(devPath) ? devPath : null;
}

// If `code` is a prod/dev conditional re-export wrapper, return an ESM module that
// re-exports the development target's explicit named exports (+ default). Returns
// null otherwise so non-matching modules pass through untouched. Detection is
// intentionally narrow (requires the `module.exports = require(...)` indirection
// AND both a `.production.js` and `.development.js` target) so it only fires on the
// React-ecosystem prod/dev idiom.
function buildCondRequireReexport(code: string, moduleId: string): string | null {
	if (!/module\.exports\s*=\s*require\(/.test(code)) return null;
	const devMatch = code.match(/require\(\s*['"]([^'"]+\.development\.js)['"]\s*\)/);
	const hasProd = /require\(\s*['"][^'"]+\.production\.js['"]\s*\)/.test(code);
	if (!devMatch || !hasProd) return null;
	const devRel = devMatch[1]; // e.g. '../cjs/use-sync-external-store-shim/with-selector.development.js'

	// Resolve the dev target to an fs path so we can lex its export names. The dev
	// file is an INTERNAL package file — usually exports-gated, so it can't be
	// resolved as `pkg/cjs/…` directly. Instead resolve the (public) WRAPPER to its
	// fs path and join the relative dev path against the wrapper's directory.
	const devPath = resolveDevTargetPath(moduleId, devRel);
	if (!devPath) return null;
	const names = lexCjsExportNames(devPath);

	// Re-export by the ORIGINAL relative path so the device transform rewrites it to
	// the dev target's `/ns/m` URL (served with real named exports). Explicit names
	// only — `export *` is downgraded to a side-effect import by the device transform.
	const target = JSON.stringify(devRel);
	const lines: string[] = [];
	if (names.length) lines.push(`export { ${names.join(', ')} } from ${target};`);
	lines.push(`export { default } from ${target};`);
	return lines.join('\n');
}

export const reactServerStrategy: FrameworkServerStrategy = {
	...typescriptServerStrategy,
	flavor: 'react',
	transformNodeModule(code: string, moduleId: string, _verbose?: boolean) {
		if (moduleId && REACT_JSX_RUNTIME_RE.test(moduleId)) {
			return REACT_JSX_RUNTIME_SHIM;
		}
		return buildCondRequireReexport(code, moduleId || '') ?? code;
	},
};
