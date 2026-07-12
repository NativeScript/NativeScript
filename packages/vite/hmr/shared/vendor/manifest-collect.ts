import path from 'path';
import fs, { readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { getMonorepoWorkspaceRoot } from '../../../helpers/project.js';

// Internal representation of resolved vendor inputs, including any metadata we
// need during esbuild bundling
export interface CollectedVendorModules {
	entries: string[];
}

// Do not force-include @nativescript/core in the dev vendor bundle.
// Keeping core out of vendor avoids duplicate side-effect registrations (e.g.,
// com.tns.FragmentClass, com.tns.NativeScriptActivity) across bundle.mjs and vendor.
// Force runtime-sensitive packages onto the vendor path so they do not drift
// between startup bundle, HTTP-wrapped CommonJS, and base-require semantics
// during HMR sessions.
const ALWAYS_INCLUDE = new Set<string>(['stacktrace-js']);
const ALWAYS_EXCLUDE = new Set<string>([
	'@nativescript/android',
	'@nativescript/ios',
	'@nativescript/types',
	'@nativescript/webpack',
	// Angular browser animations are not used in NativeScript; excluding reduces
	// memory pressure and avoids bringing partial declarations into vendor.
	'@angular/animations',
	'@angular/platform-browser/animations',
	// Not needed at runtime with linked partials; reduce vendor size/memory.
	'@angular/platform-browser-dynamic',
	// Native add-on helpers pulled by ws or others; exclude in NS dev vendor
	'bufferutil',
	'utf-8-validate',
	'node-gyp-build',
	'bufferutil',
	'utf-8-validate',
	'node-gyp-build',
	// All @babel/* and babel-* packages are build-time tools, never runtime deps.
	// They get pulled in as peer deps of packages like @nativescript-community/solid-js
	// but should never be in the vendor bundle (they require 'fs', 'path', etc.).
	'@babel/core',
	'@babel/helper-plugin-utils',
	'@babel/generator',
	'@babel/helper-string-parser',
	'@babel/helper-validator-identifier',
	'@babel/parser',
	'@babel/plugin-syntax-typescript',
	'@babel/plugin-transform-typescript',
	'@babel/preset-typescript',
	'@babel/preset-env',
	'@babel/types',
	'babel-preset-solid',
	'babel-plugin-jsx-dom-expressions',
	// Heavy dependency not needed in vendor dev bundle; fetch via HTTP loader instead
	'rxjs',
	'nativescript',
	'typescript',
	'ts-node',
	'vue-tsc',
	'ws',
	'@types/node',
	'nativescript-theme-core',
	// Build-time tools that get pulled in as transitive dependencies but should
	// never be in the device vendor bundle (they require Node built-ins like fs,
	// path, child_process, etc.). Now that we collect transitive runtime deps,
	// these need explicit exclusion.
	'esbuild',
	// Bundlers / dev-server tooling. These get dragged into the vendor set as a
	// peerDependency of runtime packages (e.g. `@tanstack/solid-start` declares
	// `vite` as a peer). Bundling Vite pulls its Node-only core (rolldown, jiti)
	// on-device, whose `import { Buffer } from 'node:buffer'` — plus
	// node:worker_threads/tty/readline/process/… — fails to instantiate on
	// NativeScript's runtime. A bundler must never ship on-device.
	'vite',
	'rollup',
	'rolldown',
	'prettier',
	'acorn',
	'recast',
	'source-map',
	'source-map-js',
	'tsx',
	'diff',
	'esprima',
	// TanStack build-time router tooling (code generation, file-based routing)
	'@tanstack/router-plugin',
	'@tanstack/router-generator',
	'@tanstack/router-utils',
	'@tanstack/virtual-file-routes',
	// File system / glob utilities — build-time only, require Node fs
	'fdir',
	'picomatch',
	'tinyglobby',
	// SSR-only library (bot detection) — not needed on device
	'isbot',
	// Type-only packages with no runtime JavaScript
	'csstype',
	// NativeScript CLI hook system — build-time only, requires Node os/path
	'@nativescript/hook',
	// Test runner uses webpack's require.context API which doesn't exist in Vite.
	// Including it in the vendor bundle causes __require.context crashes at runtime.
	'@nativescript/unit-test-runner',
	'nativescript-unit-test-runner',
	// CSS build tools — postcss, tailwindcss, and related tooling are exclusively
	// build-time processors. They require Node APIs (process, fs, path) and must
	// never run on device. esbuild bundles their transitive deps (picocolors,
	// nanoid, etc.) which reference `process` and crash at runtime.
	'tailwindcss',
	'@nativescript/tailwind',
	'postcss',
	'autoprefixer',
	'postcss-import',
	'postcss-url',
	'postcss-nested',
	'picocolors',
	'nanoid',
	// Server-side SDKs that require Node networking APIs (net, tls, dns, crypto).
	// These are backend tools, not device-side.
	'mongodb',
	// Prisma is a server-side ORM; a monorepo root commonly declares it for a
	// backend app. `@prisma/client` requires the GENERATED `.prisma/client`
	// package (may be absent entirely until `prisma generate` runs) and the
	// adapters require Node driver stacks — never device-side.
	'@prisma/client',
	'@prisma/adapter-better-sqlite3',
	'@prisma/adapter-pg',
	'@prisma/engines',
	'prisma',
	// WASM build instantiated via top-level await — cannot join the single-eval
	// es2019 vendor/deps bundle (esbuild rejects TLA at that target, and the
	// bundle's synchronous registry could not observe it anyway).
	'yoga-layout',
]);

// ============================================================================
// App-source import evidence (root-dep vendoring gate)
//
// The workspace-root sweep exists for ONE reason: hoisted monorepos declare
// packages at the root that the APP's own code imports (html-entities,
// fast-xml-parser, ...). But a monorepo root also declares backend/server
// dependencies (jose, @nestjs/*, pg, prisma, ...) that must never reach the
// device — the vendor/deps bundle EAGERLY EVALUATES every entry on-device at
// session start, so one server package importing `node:crypto` named exports
// (jose's `KeyObject`) fails instantiation of the ENTIRE dev-session graph.
// Build-time gates can't catch that: externalized builtins only fail on the
// device, at module instantiation.
//
// So root deps are gated on EVIDENCE: a root dependency joins vendor only when
// the app's device-reachable source actually imports it. "Device-reachable
// source" = the app's `src`/`app` dirs plus every workspace-root tsconfig path
// alias target (Nx-style `libs/*` sources, served through the vite pipeline —
// e.g. fast-xml-parser is imported by a lib, not by app src). App-declared
// dependencies keep the old contract (always vendored); skipped root deps keep
// per-module HTTP serving.
// ============================================================================

const SOURCE_FILE_RE = /\.(?:ts|tsx|js|jsx|mjs|cjs|vue|svelte)$/;
// `assets`/`www`/`public` are static-copy payloads (fonts, prebuilt WebView
// bundles, …) — loaded as FILES into a browser/webview realm, never through
// the device module graph. A minified webview bundle in there mentioning
// `from"partysocket"` is a false witness that would vendor (and eagerly
// evaluate) a DOM-dependent package on device (`class … extends Event` →
// bootstrap fatal).
const SOURCE_SKIP_DIR_RE = /^(?:node_modules|dist|platforms|coverage|hooks|assets|www|public|\..*)$/;
// import/export ... from 'x' | import('x') | require('x') | bare `import 'x'`
const IMPORT_SPEC_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)['"]([^'"\n]+)['"]/g;
const MAX_SCANNED_SOURCE_FILES = 20000;

// package name → every full bare specifier the app source imports from it
// (`@noble/curves` → {`@noble/curves/ed25519`}). Keeping the full specifiers
// lets the gate distinguish root-entry evidence from subpath-only evidence.
const appSourceImportsCache = new Map<string, Map<string, Set<string>>>();

function bareSpecifierToPackageName(spec: string): string | null {
	// Mirrors Node: `./x`, `../x`, `.`, `..`, absolute paths are non-bare.
	// Alias-shaped ids (`~/x`, `@/x`, `#x`) can't be npm root deps and are
	// harmless if collected — they simply never intersect the root dep names.
	if (!spec || spec === '.' || spec === '..' || spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/') || /^[A-Za-z]:[\\/]/.test(spec) || spec.startsWith('node:')) {
		return null;
	}
	const parts = spec.split('/');
	return spec.startsWith('@') ? (parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null) : parts[0];
}

// Crude-but-safe JSONC comment strip for tsconfig files (string-aware).
function stripJsonComments(text: string): string {
	let out = '';
	let inString = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (inString) {
			out += ch;
			if (ch === '\\') {
				out += text[++i] ?? '';
			} else if (ch === '"') {
				inString = false;
			}
		} else if (ch === '"') {
			inString = true;
			out += ch;
		} else if (ch === '/' && text[i + 1] === '/') {
			while (i < text.length && text[i] !== '\n') i++;
			out += '\n';
		} else if (ch === '/' && text[i + 1] === '*') {
			i += 2;
			while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
			i++;
		} else {
			out += ch;
		}
	}
	return out;
}

function deviceReachableSourceRoots(projectRoot: string, workspaceRoot: string): string[] {
	const roots: string[] = [];
	const addDir = (candidate: string) => {
		try {
			let dir = candidate;
			// A candidate naming an existing FILE (alias target like
			// `libs/x/src/index.ts`) means "scan that file's directory" — but a
			// candidate that doesn't exist at all must be SKIPPED, never walked up
			// to an existing ancestor. Walking up turned a missing `<app>/app` into
			// scanning the whole project root, which swept root-level BUILD CONFIG
			// files (vite-app.config.ts importing @sentry/vite-plugin) into
			// "device-reachable evidence" and vendored server-only toolchains.
			if (!fs.existsSync(dir)) return;
			if (!fs.statSync(dir).isDirectory()) dir = path.dirname(dir);
			if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
			dir = path.resolve(dir);
			// Never scan node_modules-resolved targets or an ancestor of the
			// workspace root; dedup nested dirs.
			if (dir.includes(`${path.sep}node_modules${path.sep}`) || workspaceRoot.startsWith(dir + path.sep) || dir === workspaceRoot) return;
			for (const existing of roots) {
				if (dir === existing || dir.startsWith(existing + path.sep)) return;
			}
			for (let i = roots.length - 1; i >= 0; i--) {
				if (roots[i].startsWith(dir + path.sep)) roots.splice(i, 1);
			}
			roots.push(dir);
		} catch {
			// unreadable candidate — skip
		}
	};
	for (const d of ['src', 'app']) addDir(path.join(projectRoot, d));
	for (const tsconfigName of ['tsconfig.base.json', 'tsconfig.json']) {
		const tsconfigPath = path.join(workspaceRoot, tsconfigName);
		if (!fs.existsSync(tsconfigPath)) continue;
		try {
			const cfg = JSON.parse(stripJsonComments(readFileSync(tsconfigPath, 'utf-8')));
			const paths: Record<string, unknown> = cfg?.compilerOptions?.paths ?? {};
			for (const targets of Object.values(paths)) {
				for (const target of Array.isArray(targets) ? targets : []) {
					// `libs/x/src/index.ts` and `libs/x/src/*` both → `libs/x/src`
					addDir(path.resolve(workspaceRoot, String(target).replace(/\*.*$/, '')));
				}
			}
		} catch {
			// Unparseable tsconfig — app src roots still provide most evidence.
		}
		break;
	}
	return roots;
}

// Strip JS/TS comments (string-aware) before import matching. A commented-out
// `// import "sacn";` is NOT evidence — it vendored Node-only DMX libraries
// whose eager on-device evaluation was fatal (`Buffer is not defined`). The
// stripper tracks '\''/'"'/backtick strings with escapes; it does NOT lex
// regex literals, so a `/*` inside a regex can over-strip the REST of one
// file. That bias is deliberate: lost evidence only demotes a package to
// per-module HTTP serving, while fabricated evidence eagerly evaluates it on
// device (a bootstrap fatal) — and imports sit above regex-bearing code in
// practice.
function stripJsComments(text: string): string {
	let out = '';
	type State = 'code' | 'line' | 'block' | 'single' | 'double' | 'template';
	let state: State = 'code';
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const next = text[i + 1];
		switch (state) {
			case 'code':
				if (ch === '/' && next === '/') {
					state = 'line';
					i++;
				} else if (ch === '/' && next === '*') {
					state = 'block';
					i++;
				} else {
					if (ch === "'") state = 'single';
					else if (ch === '"') state = 'double';
					else if (ch === '`') state = 'template';
					out += ch;
				}
				break;
			case 'line':
				if (ch === '\n') {
					state = 'code';
					out += ch;
				}
				break;
			case 'block':
				if (ch === '*' && next === '/') {
					state = 'code';
					i++;
				} else if (ch === '\n') {
					out += ch; // keep line numbers meaningful for debugging
				}
				break;
			case 'single':
			case 'double':
			case 'template': {
				out += ch;
				if (ch === '\\') {
					out += text[++i] ?? '';
				} else if ((state === 'single' && ch === "'") || (state === 'double' && ch === '"') || (state === 'template' && ch === '`') || (state !== 'template' && ch === '\n')) {
					state = 'code';
				}
				break;
			}
		}
	}
	return out;
}

function collectAppSourceBareImports(projectRoot: string, workspaceRoot: string, debug: boolean): Map<string, Set<string>> {
	const cached = appSourceImportsCache.get(projectRoot);
	if (cached) return cached;
	const specsByPackage = new Map<string, Set<string>>();
	let scanned = 0;
	const walk = (dir: string) => {
		if (scanned >= MAX_SCANNED_SOURCE_FILES) return;
		let dirents: fs.Dirent[];
		try {
			dirents = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const dirent of dirents) {
			if (scanned >= MAX_SCANNED_SOURCE_FILES) return;
			if (dirent.isDirectory()) {
				if (!SOURCE_SKIP_DIR_RE.test(dirent.name)) walk(path.join(dir, dirent.name));
			} else if (dirent.isFile() && SOURCE_FILE_RE.test(dirent.name)) {
				scanned++;
				let text: string;
				try {
					text = stripJsComments(readFileSync(path.join(dir, dirent.name), 'utf-8'));
				} catch {
					continue;
				}
				IMPORT_SPEC_RE.lastIndex = 0;
				let match: RegExpExecArray | null;
				while ((match = IMPORT_SPEC_RE.exec(text)) !== null) {
					const name = bareSpecifierToPackageName(match[1]);
					if (name) {
						let specs = specsByPackage.get(name);
						if (!specs) specsByPackage.set(name, (specs = new Set()));
						specs.add(match[1]);
					}
				}
			}
		}
	};
	const t0 = Date.now();
	for (const root of deviceReachableSourceRoots(projectRoot, workspaceRoot)) walk(root);
	if (debug) {
		console.log(`[vendor] app-source import scan: ${specsByPackage.size} bare packages across ${scanned} files in ${Date.now() - t0}ms`);
	}
	appSourceImportsCache.set(projectRoot, specsByPackage);
	return specsByPackage;
}

export function collectVendorModules(projectRoot: string, platform: string, flavor?: string): CollectedVendorModules {
	const packageJsonPath = path.resolve(projectRoot, 'package.json');
	const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	const projectRequire = createRequire(packageJsonPath);
	const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';

	const vendor = new Set<string>();
	const visited = new Set<string>();
	const queue: string[] = [];
	// Local-source deps (file: pointing to a directory, link:, workspace:) are
	// app code, not pre-packaged libraries. esbuild's vendor pipeline has none
	// of the user's tsconfig path aliases or other Vite plugin resolvers, so
	// any aliased import inside their source will fail with "Could not
	// resolve". We collect their names here so that peer-dep traversal can
	// also skip them.
	const localSourceNames = new Set<string>();

	// Packages the user explicitly opted out of via NS_VENDOR_EXCLUDE. Applied
	// here — not only as the final `vendor.delete()` sweep below — so an excluded
	// package is never queued for peer-dependency traversal. Otherwise it can
	// still drag its peers (notably build tools such as `vite`, declared as a
	// peer of `@tanstack/solid-start`) into the bundle before it is itself
	// removed. Anything genuinely needed at runtime but kept out of vendor is
	// still served over HTTP by the dev server's module loader.
	const envExcludes = new Set(parseEnvList(process.env.NS_VENDOR_EXCLUDE));

	const isPackageRootSpecifier = (name: string): boolean => {
		if (!name) return false;
		if (name.startsWith('@')) {
			// Scoped: @scope/name is root; anything deeper is subpath
			const parts = name.split('/');
			return parts.length === 2;
		}
		// Unscoped: no slash means root; any slash means subpath
		return !name.includes('/');
	};

	const isAngularFlavor = flavor === 'angular';
	const isSolidFlavor = flavor === 'solid';
	const addCandidate = (name: string) => {
		if (!name || shouldSkipDependency(name)) {
			return;
		}
		// Honor NS_VENDOR_EXCLUDE up front so an opted-out package is neither
		// vendored nor traversed for peers (see envExcludes above).
		if (envExcludes.has(name)) {
			return;
		}
		// Avoid pulling Angular compiler/runtime into the dev vendor bundle when
		// the current project flavor is not Angular (for example, solid). This
		// prevents esbuild from trying to bundle @angular/compiler and its Babel
		// toolchain, which requires Node built-ins like fs/path/url.
		if (!isAngularFlavor && (name === '@angular/compiler' || name.startsWith('@angular/'))) {
			return;
		}
		// For the Solid flavor, keep `solid-js` itself OUT of the vendor bundle.
		//
		// Both `@solid-refresh` (served via HTTP) and Vite-aliased user code
		// import `solid-js` through the dev server, while the vendor bundle
		// pulls it in as a peerDependency of `@nativescript-community/solid-js`.
		// Two copies → two `Owner` module-locals → the proxy memo created by
		// `solid-refresh`'s `HMRComp` is registered on the HTTP copy's Owner
		// (which is always null — hence the
		// `computations created outside a createRoot or render` warning), while
		// `render(App, doc)` runs against the vendor copy's Owner. Same chain
		// breaks HMR propagation: `patchRegistry`'s `setComp` ticks the HTTP
		// copy's signal but the live page tree subscribes through the vendor
		// copy's reactive graph, so the new component body never reaches the
		// screen.
		//
		// We pair this skip with the matching esbuild externalization
		// (`nsSolidJsExternalPlugin`) and an import-map redirect in
		// `import-map.ts` that points `solid-js` at the HTTP URL. All three
		// converge on the same dev-server URL, V8 dedupes by URL, and the
		// app sees a single `solid-js` realm.
		if (isSolidFlavor && name === 'solid-js') {
			return;
		}
		// Skip already-visited packages to avoid redundant queue processing
		if (visited.has(name)) {
			return;
		}
		visited.add(name);
		vendor.add(name);
		const isRoot = isPackageRootSpecifier(name);
		// Only traverse deps for package roots; subpaths should not attempt package.json resolution
		if (isRoot) {
			queue.push(name);
		}
	};

	const addDeps = (deps: Record<string, unknown> | undefined) => {
		if (!deps) {
			return;
		}
		for (const [name, spec] of Object.entries(deps)) {
			if (isUnvendorableLocalSource(name, spec, projectRequire, platform)) {
				// Defer to the regular Vite/Rolldown pipeline (HTTP-served in
				// dev, bundled in production) where the
				// ns-tsconfig-paths-resolver and the rest of the plugin chain
				// can handle aliased imports. Local .tgz file: refs ARE proper
				// packaged libraries and DO stay in vendor; so do file:
				// directory refs that point at packages with compiled JS
				// entry points (a common NativeScript monorepo pattern that
				// hoists installs and re-exposes them from the app's
				// package.json via `file:../../node_modules/<name>`).
				localSourceNames.add(name);
				if (debug) {
					console.log(`[vendor] skipping local source dependency ${name} (spec: ${String(spec)})`);
				}
				continue;
			}
			addCandidate(name);
		}
	};

	addDeps(pkg.dependencies);
	addDeps(pkg.optionalDependencies);

	// Monorepo hoisting: the app commonly resolves runtime packages declared in
	// the WORKSPACE ROOT package.json (Nx-style single-version workspaces hoist
	// everything there — the app's own package.json lists only the NS
	// runtime/plugin subset). Collecting only the app's deps left those hoisted
	// packages out of the vendor manifest entirely, so their imports fell
	// through to per-module HTTP CommonJS serving with fragile interop
	// (observed: `html-entities` losing its named exports → `decode is not
	// defined`, then `.html5` of undefined once required over HTTP). Runtime
	// `dependencies` only — root devDependencies are build tooling by
	// convention, and the skip rules still filter framework/tooling packages.
	//
	// Root deps are additionally gated on bare-entry resolvability: a monorepo
	// root can declare packages with no root entry at all (e.g. `emojibase-data`
	// exports only subpaths), and importing such a name from the generated
	// vendor entry fails the entire esbuild build. Skipped packages simply keep
	// today's HTTP-served behavior.
	try {
		const workspaceRootPath = getMonorepoWorkspaceRoot(projectRoot);
		if (workspaceRootPath && path.resolve(workspaceRootPath) !== path.resolve(projectRoot)) {
			const rootPkg = JSON.parse(readFileSync(path.join(workspaceRootPath, 'package.json'), 'utf-8'));
			// Evidence gate: only root deps the app's device-reachable source
			// actually imports (see the scanner above for the full rationale —
			// vendor entries are eagerly EVALUATED on-device, so server-side root
			// deps must never be swept in just because they resolve).
			const appImports = collectAppSourceBareImports(projectRoot, path.resolve(workspaceRootPath), debug);
			const addRootDeps = (deps: Record<string, unknown> | undefined) => {
				if (!deps) return;
				for (const [name, spec] of Object.entries(deps)) {
					if (isUnvendorableLocalSource(name, spec, projectRequire, platform)) continue;
					// Policy exclusions match PACKAGE NAMES (`@prisma/client` in
					// ALWAYS_EXCLUDE / NS_VENDOR_EXCLUDE); check here so subpath specs
					// (`@prisma/client/runtime/…`) can't route around an excluded name.
					if (shouldSkipDependency(name) || envExcludes.has(name)) {
						if (debug) console.log(`[vendor] skipping root dependency ${name} (excluded by policy)`);
						continue;
					}
					const importedSpecs = appImports.get(name);
					if (!importedSpecs) {
						if (debug) console.log(`[vendor] skipping root dependency ${name} (not imported by app source)`);
						continue;
					}
					if (importedSpecs.has(name)) {
						// Root-entry evidence — vendor the package root (old contract).
						try {
							projectRequire.resolve(name);
						} catch {
							if (debug) console.log(`[vendor] skipping root dependency ${name} (no resolvable bare entry)`);
							continue;
						}
						addCandidate(name);
						continue;
					}
					// Subpath-only evidence: the app never imports the package ROOT, and
					// vendor entries are eagerly evaluated on-device — some roots throw
					// BY DESIGN to force submodule imports (`@noble/curves`: "Incorrect
					// usage. Import submodules instead", killing dev-session bootstrap).
					// Vendor exactly the subpaths the app imports; anything else in the
					// package keeps per-module HTTP serving.
					for (const subpath of importedSpecs) {
						try {
							projectRequire.resolve(subpath);
						} catch {
							if (debug) console.log(`[vendor] skipping root dependency subpath ${subpath} (not resolvable)`);
							continue;
						}
						if (debug) console.log(`[vendor] vendoring subpath ${subpath} (root ${name} has subpath-only evidence)`);
						addCandidate(subpath);
					}
				}
			};
			addRootDeps(rootPkg.dependencies);
			addRootDeps(rootPkg.optionalDependencies);
		}
	} catch {
		// No workspace root / unreadable root package.json — single-repo layout.
	}

	for (const name of ALWAYS_INCLUDE) {
		// Some force-included packages are only present transitively in apps that
		// actually use them. Skip missing packages quietly so unrelated projects do
		// not fail vendor collection just because the policy list names them.
		if (canResolveDependencyPackageJson(name, projectRequire)) {
			addCandidate(name);
		}
	}

	// Ensure Android Activity proxy is present for SBG scanning in dev/HMR
	// and non-HMR builds alike: explicitly include the side-effect module
	// that registers `com.tns.NativeScriptActivity`.
	if (platform === 'android') {
		addCandidate('@nativescript/core/ui/frame/activity.android');
	}

	if (pkg.dependencies?.['nativescript-vue'] && pkg.devDependencies?.vue) {
		addCandidate('vue');
	}

	// Angular framework packages are intentionally NOT added to vendor. They are
	// served via HTTP only so every importer resolves to a single module realm.
	// See shouldSkipDependency() for the full rationale. RxJS is also left out of
	// vendor (large, and not required in the vendor bundle for dev HMR).

	if (pkg.dependencies?.['react-nativescript']) {
		if (pkg.dependencies?.react) {
			addCandidate('react');
		}
		if (pkg.dependencies?.['react-dom']) {
			addCandidate('react-dom');
		}
	}

	// SolidJS / TanStack Router: when @nativescript/tanstack-router is a dependency,
	// its runtime deps (@tanstack/solid-router, @tanstack/router-core, @tanstack/history)
	// MUST be in the vendor bundle. These packages:
	// 1. Use browser APIs (window.dispatchEvent) that don't exist in NativeScript — they
	//    must be bundled where the NativeScript wrapper intercepts those calls
	// 2. Contain JSX source that needs Solid compilation (dist/source/*.jsx) — the HTTP
	//    fallback can't compile node_modules JSX since vite-plugin-solid skips it
	// 3. Import solid-js internally — loading via HTTP creates a separate solid-js instance
	// esbuild uses the 'import' condition (not 'solid'), resolving to pre-compiled
	// dist/esm/*.js which avoids all three issues.
	if (pkg.dependencies?.['@nativescript/tanstack-router']) {
		addCandidate('@tanstack/solid-router');
		addCandidate('@tanstack/router-core');
		addCandidate('@tanstack/history');
	}

	parseEnvList(process.env.NS_VENDOR_INCLUDE).forEach(addCandidate);

	const projectDeps = {
		dependencies: new Set(Object.keys(pkg.dependencies ?? {})),
		optional: new Set(Object.keys(pkg.optionalDependencies ?? {})),
		dev: new Set(Object.keys(pkg.devDependencies ?? {})),
	};

	while (queue.length) {
		const specifier = queue.shift()!;
		const dependencyPkg = readDependencyPackageJson(specifier, projectRequire);
		if (!dependencyPkg) {
			continue;
		}

		const peerDependencies = Object.keys(dependencyPkg.peerDependencies ?? {});
		for (const peer of peerDependencies) {
			if (shouldSkipDependency(peer) || localSourceNames.has(peer)) {
				continue;
			}
			if (projectDeps.dependencies.has(peer) || projectDeps.optional.has(peer) || projectDeps.dev.has(peer)) {
				addCandidate(peer);
			}
		}

		// NOTE: We intentionally do NOT collect transitive runtime dependencies
		// here. The import map + runtime specifier normalization handles non-vendor
		// packages by routing them through HTTP to the Vite dev server. This avoids
		// the fragility of trying to esbuild-bundle every transitive dep (which can
		// fail due to Node built-ins, type-only packages, duplicate module instances,
		// etc.). Only direct project dependencies go into the vendor bundle.
	}

	parseEnvList(process.env.NS_VENDOR_EXCLUDE).forEach((name) => {
		vendor.delete(name);
	});

	return {
		entries: Array.from(vendor).sort(),
	};
}

function shouldSkipDependency(name: string): boolean {
	if (!name) {
		return true;
	}
	if (ALWAYS_EXCLUDE.has(name)) {
		return true;
	}
	// Angular framework packages must only be served via the HTTP path so every
	// importer resolves to a single module realm. When these packages are present
	// in the vendor bundle AND imported by app modules via HTTP subpath, every
	// @Component/@Injectable gets defined twice (once per realm), producing NG0912
	// selector collisions, cross-realm `instanceof` failures, and dual class
	// identities throughout Angular's DI container. HTTP-only is the single-realm
	// invariant for user-level framework code.
	if (name === '@nativescript/angular' || name === 'nativescript-angular' || name.startsWith('@angular/')) {
		return true;
	}
	// masonkit is the de-facto NativeScript flexbox/grid layout engine. Like the
	// frameworks above it MUST resolve to a single module instance: it registers
	// global CSS layout properties on core's `Style` (`paddingProperty.register(Style)`,
	// flexbox handlers, etc.) AND tags views with module-level Symbols
	// (`isMasonView_`/`isMasonChild_`). If it lands in the vendor bundle while an app
	// also imports a subpath that escapes to HTTP (e.g. `@triniwiz/nativescript-masonkit/web`,
	// which has no manifest alias and is served via /ns/m), the two copies load
	// `./symbols` separately → divergent Symbols → a view tagged by one copy isn't
	// recognized by the other's CSS handlers → layout props never reach the native
	// mason node (collapsed spacing, square corners) while core color/background still
	// apply. HTTP-only makes every importer converge on one dev-server URL (V8 dedupes
	// by URL) = single instance. (Dev/HMR only; production is a single bundle.)
	if (name === '@triniwiz/nativescript-masonkit') {
		return true;
	}
	// All Babel packages are build tools — never bundle into device runtime.
	// They require Node built-ins (fs, path, url) that don't exist on device.
	if (name.startsWith('@babel/') || name.startsWith('babel-')) {
		return true;
	}
	// Dev tools and type-only packages — not needed on device
	if (name.startsWith('@solid-devtools/')) {
		return true;
	}
	if (name.startsWith('@types/')) {
		return true;
	}
	// PostCSS ecosystem — all build-time CSS processing
	if (name === 'postcss' || name.startsWith('postcss-')) {
		return true;
	}
	// Tailwind ecosystem — build-time only CSS framework
	if (name.includes('tailwind')) {
		return true;
	}
	// Test runners and frameworks — never needed on device
	if (name.includes('test-runner') || name.includes('unit-test')) {
		return true;
	}
	// Linters and formatters — build-time tools
	if (name.includes('eslint') || name.includes('stylelint')) {
		return true;
	}
	if (name.startsWith('.')) {
		return true;
	}
	if (name.startsWith('file:')) {
		return true;
	}
	if (name.startsWith('workspace:')) {
		return true;
	}
	if (name.startsWith('link:')) {
		return true;
	}
	return false;
}

const COMPILED_JS_ENTRY_EXTENSIONS = ['.js', '.mjs', '.cjs'];
const COMPILED_JS_ENTRY_REGEX = /\.(?:c|m)?jsx?$/;

function compiledJsExtensionsForPlatform(platform: string | undefined): string[] {
	const exts = [...COMPILED_JS_ENTRY_EXTENSIONS];
	switch (platform) {
		case 'android':
			exts.push('.android.js');
			break;
		case 'ios':
			exts.push('.ios.js', '.visionos.js');
			break;
		case 'visionos':
			exts.push('.visionos.js', '.ios.js');
			break;
	}
	return exts;
}

/**
 * Determine whether a `package.json` dependency must be excluded from the
 * HMR vendor bundle because esbuild's standalone vendor pipeline can't
 * resolve its source.
 *
 * The HMR vendor bundle is generated by a standalone esbuild build that
 * has none of the Vite plugin chain (most notably
 * `ns-tsconfig-paths-resolver`), so any aliased import inside the
 * package's **source** files will fail with "Could not resolve" and abort
 * the whole bundle.
 *
 * Skip:
 *  - `link:` and `workspace:` refs (always app-side source).
 *  - `file:` refs to a directory whose installed package only ships
 *    TypeScript/JSX source (no compiled `.js`/`.mjs`/`.cjs` entry).
 *
 * Keep (return false):
 *  - Regular semver / git / url specs (normal third-party libraries).
 *  - Local `.tgz` file refs (pre-packaged libraries extracted at install).
 *  - `file:` directory refs that resolve to a package with a compiled JS
 *    entry — a common NativeScript monorepo convention where the app's
 *    `package.json` redirects to `../../node_modules/<name>` to avoid
 *    duplicate installs while letting the NativeScript CLI discover
 *    plugins from the app directory.
 */
function isUnvendorableLocalSource(name: string, spec: unknown, projectRequire: ReturnType<typeof createRequire>, platform?: string): boolean {
	if (typeof spec !== 'string') return false;
	if (spec.startsWith('link:') || spec.startsWith('workspace:')) return true;
	if (!spec.startsWith('file:')) return false;
	// Tarballs are already pre-packaged libraries — install extracts them
	// into a normal node_modules entry.
	if (/\.t(?:ar\.)?gz(?:[?#].*)?$/.test(spec)) return false;
	// Directory file: refs need a deeper check: peek at the installed
	// package.json and ask "does this ship compiled JS?". If yes, vendor
	// it. If no (TS source only), defer to the regular Vite pipeline.
	return !packageHasCompiledJsEntry(name, projectRequire, platform);
}

function packageHasCompiledJsEntry(name: string, projectRequire: ReturnType<typeof createRequire>, platform?: string): boolean {
	let pkgJsonPath: string;
	try {
		pkgJsonPath = projectRequire.resolve(`${name}/package.json`);
	} catch {
		return false;
	}
	let pkg: any;
	try {
		pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
	} catch {
		return false;
	}
	const pkgDir = path.dirname(pkgJsonPath);
	const candidates: string[] = [];
	const pushCandidate = (value: unknown) => {
		if (typeof value === 'string' && value) candidates.push(value);
	};
	pushCandidate(pkg.module);
	pushCandidate(pkg.main);
	// Recursively flatten conditional `exports` maps to surface concrete
	// file paths. We only need `string` leaves; anything else (function-
	// based exports, etc.) doesn't apply to esbuild's resolution.
	const visitExports = (node: any) => {
		if (!node) return;
		if (typeof node === 'string') {
			pushCandidate(node);
			return;
		}
		if (Array.isArray(node)) {
			for (const item of node) visitExports(item);
			return;
		}
		if (typeof node === 'object') {
			for (const value of Object.values(node)) visitExports(value);
		}
	};
	visitExports(pkg.exports);
	if (candidates.length === 0) {
		// node's default lookup falls back to `index.js`.
		candidates.push('index');
	}
	const extensionsToTry = compiledJsExtensionsForPlatform(platform);
	for (const cand of candidates) {
		const abs = path.resolve(pkgDir, cand);
		const ext = path.extname(cand);
		if (COMPILED_JS_ENTRY_REGEX.test(cand)) {
			// Explicit JS extension. If the file exists, vendor it. If not
			// (a NativeScript plugin commonly declares `main: "index.js"`
			// but ships only platform variants like `index.ios.js`), try
			// the platform-specific variants which esbuild's
			// `resolveExtensions` will pick up at bundle time.
			if (fs.existsSync(abs)) return true;
			const baseAbs = abs.slice(0, -ext.length);
			for (const e of extensionsToTry) {
				if (fs.existsSync(baseAbs + e)) return true;
			}
			continue;
		}
		if (!ext) {
			// Extensionless main — try plain JS variants AND the
			// platform-specific variants NativeScript plugins commonly use
			// (`index.ios.js`, `index.android.js`, `index.visionos.js`).
			for (const e of extensionsToTry) {
				if (fs.existsSync(abs + e)) return true;
			}
			continue;
		}
		// A non-JS extension (typically `.ts`/`.tsx`) means the package
		// only ships TS source — esbuild's vendor pipeline can't resolve
		// any tsconfig-aliased imports inside it.
	}
	return false;
}

function canResolveDependencyPackageJson(specifier: string, projectRequire: ReturnType<typeof createRequire>): boolean {
	try {
		projectRequire.resolve(`${specifier}/package.json`);
		return true;
	} catch {
		return false;
	}
}

function readDependencyPackageJson(specifier: string, projectRequire: ReturnType<typeof createRequire>) {
	try {
		const packageJsonPath = projectRequire.resolve(`${specifier}/package.json`);
		return JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	} catch (error) {
		if (process.env.VITE_DEBUG_LOGS) {
			console.warn(`[vendor] unable to resolve ${specifier} package.json`, error);
		}
		return null;
	}
}

function parseEnvList(value: string | undefined): string[] {
	if (!value) {
		return [];
	}
	return value
		.split(',')
		.map((token) => token.trim())
		.filter(Boolean);
}
