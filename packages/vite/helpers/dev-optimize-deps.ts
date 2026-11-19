import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { getFrameworkServerStrategy } from '../hmr/framework-flavors.js';
import { collectImportMapSpecifiers } from '../hmr/server/import-map.js';
import { createNsDevClientModuleCode } from '../hmr/server/vite-plugin.js';
import { listBundlerContextCodeFiles, shouldExcludePlatformFile, walkAppFiles } from './bundler-context.js';
import { generateDevBootCode } from './main-entry.js';
import { findPackageInNodeModules } from './module-resolution.js';
import { getNsOptimizeDepsExclude, isExcludedSpecifier, NS_OPTIMIZE_DEPS_EXCLUDE } from './optimize-deps.js';
import type { Platform } from './platform-types.js';
import { getLinkedDependencyNames, getPackageJson, getProjectFilePath } from './project.js';
import { resolveMainFieldPlatformVariant } from './resolve-main-field-platform.js';
import { getProjectAppPath } from './utils.js';

const GLOB_SPECIAL = /[*?[\]{}()!]/g;

/** A file as an `optimizeDeps.entries` pattern matching only itself. */
export function toEntryPattern(file: string, root: string): string {
	return path.relative(root, file).split(path.sep).join('/').replace(GLOB_SPECIAL, '\\$&');
}

/** The package name of a bare specifier (`@scope/pkg/sub` → `@scope/pkg`). */
export function packageNameOf(spec: string): string {
	const parts = spec.split('/');
	return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** The specifiers of the top-level static `import` statements of generated code. */
export function staticImportSpecifiers(code: string): string[] {
	return [...code.matchAll(/^import\s+(?:[^'";]*?\s+from\s+)?(['"])([^'"]+)\1/gm)].map((match) => match[2]);
}

const isBareSpecifier = (spec: string) => !/^(?:[./]|[a-z][a-z0-9+.-]*:)/i.test(spec);

function isFile(file: string): boolean {
	try {
		return statSync(file).isFile();
	} catch {
		return false;
	}
}

/** `base` itself, else with each extension, else its `index` with each extension. */
export function resolveFileWithExtensions(base: string, extensions: readonly string[]): string | undefined {
	return [base, ...extensions.map((ext) => base + ext), ...extensions.map((ext) => path.join(base, `index${ext}`))].find(isFile);
}

function readPackageJson(dir: string): Record<string, any> | undefined {
	try {
		return JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf-8'));
	} catch {
		return undefined;
	}
}

/**
 * The packages among `names` whose root import the `enforce: 'pre'` package
 * resolvers (`nativescript-package-resolver`, `package-platform-aliases`)
 * rewrite to a platform file. That resolution bypasses Vite's, so served
 * code never reaches a pre-bundle of them.
 */
export function getPlatformMainPackageNames(names: Iterable<string>, projectRoot: string, platform: Platform): string[] {
	const out: string[] = [];
	for (const name of names) {
		const dir = findPackageInNodeModules(name, projectRoot);
		const pkg = dir && readPackageJson(dir);
		if (pkg && resolveMainFieldPlatformVariant(dir, pkg.main, platform)) out.push(name);
	}
	return out;
}

const EXPORT_CONDITIONS = new Set(['import', 'module', 'browser', 'development', 'default']);

function exportsRootTarget(exportsField: unknown): string | undefined {
	if (typeof exportsField === 'string') return exportsField;
	if (Array.isArray(exportsField)) return exportsField.map(exportsRootTarget).find(Boolean);
	if (!exportsField || typeof exportsField !== 'object') return undefined;
	const entries = Object.entries(exportsField);
	if (entries.some(([key]) => key.startsWith('.'))) return exportsRootTarget((exportsField as Record<string, unknown>)['.']);
	for (const [condition, target] of entries) {
		const file = EXPORT_CONDITIONS.has(condition) ? exportsRootTarget(target) : undefined;
		if (file) return file;
	}
	return undefined;
}

/**
 * The file a bare import of the package in `dir` loads: the platform `main`
 * variant the `enforce: 'pre'` package resolvers serve, else the root
 * `exports` target, `module`, `main` or `index`.
 */
export function resolvePackageEntryFile(dir: string, platform: Platform, extensions: readonly string[]): string | undefined {
	const pkg = readPackageJson(dir);
	if (!pkg) return undefined;
	const platformMain = resolveMainFieldPlatformVariant(dir, pkg.main, platform);
	if (platformMain) return platformMain;
	for (const target of [exportsRootTarget(pkg.exports), pkg.module, pkg.main, 'index']) {
		const file = typeof target === 'string' ? resolveFileWithExtensions(path.join(dir, target), extensions) : undefined;
		if (file) return file;
	}
	return undefined;
}

/** True when the installed package `name` declares or ships a JavaScript entry (not a CSS-only package). */
export function hasJavaScriptEntry(name: string, projectRoot: string): boolean {
	const dir = findPackageInNodeModules(name, projectRoot);
	const pkg = dir && readPackageJson(dir);
	if (!pkg) return false;
	return !!(pkg.exports || pkg.module || pkg.main) || ['index.js', 'index.mjs'].some((f) => isFile(path.join(dir, f)));
}

export interface DevOptimizeDepsOptions {
	projectRoot: string;
	flavor: string;
	platform: Platform;
	/** `resolve.extensions`, in order. */
	extensions: readonly string[];
	/** Package directories that differ from Node resolution from `projectRoot` (aliased packages). */
	packageDirs?: Record<string, string>;
	verbose?: boolean;
}

/**
 * The dev server's `optimizeDeps` lists.
 *
 * - `exclude`: {@link getNsOptimizeDepsExclude}, every linked dependency and
 *   every platform-main package ({@link getPlatformMainPackageNames}). With
 *   `preserveSymlinks` a linked package's files sit under `node_modules`, so
 *   Vite would pre-bundle it, or inline it into another pre-bundle, instead
 *   of serving its watched source.
 * - `include`: the bare imports of the dev boot module (a virtual module the
 *   scanner never reads), the import map's package keys (the app's
 *   `dependencies` with a JavaScript entry and the flavor's specifiers:
 *   compilers add imports of them that no source file has, such as
 *   Angular's template dependencies); never an excluded one.
 * - `entries`: the app entry, the app files the boot module imports, the
 *   bundler context's code files (all reached only through virtual modules),
 *   the files of excluded packages the boot module and the dev client
 *   import, and the entry file ({@link resolvePackageEntryFile}) of every
 *   linked or platform-main package in `dependencies` or the boot imports
 *   (`devDependencies` hold build tooling, which the device never loads).
 *   The scanner does not follow an import of an excluded package, so it
 *   reads their sources from these files and finds the third-party packages
 *   they import (`tslib`, `css-tree`, ...), which then get pre-bundled once
 *   for every importer, served or pre-bundled. Unscanned, such a package is
 *   served unbundled when its importer's path is under `node_modules` (a
 *   CommonJS one then fails to load), is discovered only at request time
 *   otherwise (a re-optimization that reloads the app), and loads twice when
 *   a pre-bundle also imports it. A bare import in a scanned file that does
 *   not resolve fails the whole scan (Vite then skips pre-bundling).
 */
export function getDevOptimizeDeps(opts: DevOptimizeDepsOptions): { entries: string[]; include: string[]; exclude: string[] } {
	const { projectRoot, flavor, platform } = opts;
	const pkg = getPackageJson();
	const bootImports = staticImportSpecifiers(generateDevBootCode({ platform, verbose: !!opts.verbose, flavor }));
	const clientImports = staticImportSpecifiers(createNsDevClientModuleCode({ wsUrl: '', wsProtocol: '', entryUrl: '', origin: '' }));
	const bootBare = bootImports.filter(isBareSpecifier);

	const declared = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'].flatMap((section) => Object.keys(pkg[section] ?? {}));
	const servedPackages = [...new Set([...getLinkedDependencyNames(projectRoot), ...getPlatformMainPackageNames(new Set([...declared, ...bootBare.map(packageNameOf)]), projectRoot, platform)])];
	const coreDir = opts.packageDirs?.['@nativescript/core'] ?? findPackageInNodeModules('@nativescript/core', projectRoot);
	// `resolve.alias` resolves core ahead of the package resolvers, so its extensionless `main` doesn't make it platform-main.
	const exclude = [...new Set([...getNsOptimizeDepsExclude(coreDir), ...servedPackages.filter((name) => !isExcludedSpecifier(name, NS_OPTIMIZE_DEPS_EXCLUDE))])];
	const runtimePackages = new Set([...Object.keys(pkg.dependencies ?? {}), ...bootBare.map(packageNameOf)]);

	const strategy = getFrameworkServerStrategy(flavor);
	const strategySpecifiers = new Set(strategy?.importMapSpecifiers?.() ?? []);
	const mapPackages = collectImportMapSpecifiers({ origin: '', flavor, projectRoot, strategy }).filter((spec) => isBareSpecifier(spec) && (strategySpecifiers.has(spec) || hasJavaScriptEntry(spec, projectRoot)));
	// Imported by modules the scanner never reads: `virtual:ns-xhr-polyfill` (a boot import) and the
	// `require` helper `nsModuleRequirePlugin` injects into served modules.
	const unscannedImports = ['@nativescript/core/xhr', '@nativescript/core/file-system'];
	const include = [...new Set([...bootBare, ...unscannedImports, ...mapPackages])].filter((spec) => !isExcludedSpecifier(spec, exclude));

	const mainEntry = getProjectFilePath(pkg.main);
	const files = [mainEntry, ...bootImports.filter((spec) => spec.startsWith('/')).map((spec) => path.join(projectRoot, spec))];
	if (flavor === 'typescript' || flavor === 'javascript') {
		const appFiles = walkAppFiles(getProjectAppPath()).filter((f) => !shouldExcludePlatformFile(f, platform));
		files.push(...listBundlerContextCodeFiles(flavor, appFiles, mainEntry).map((f) => path.resolve(projectRoot, f)));
	}
	// App code imports core's barrel, which the scanner doesn't follow (core is excluded).
	for (const spec of new Set([...bootBare, ...clientImports.filter(isBareSpecifier), '@nativescript/core'])) {
		if (!isExcludedSpecifier(spec, exclude)) continue;
		const name = packageNameOf(spec);
		const dir = opts.packageDirs?.[name] ?? findPackageInNodeModules(name, projectRoot);
		const file = dir && resolveFileWithExtensions(path.join(dir, spec.slice(name.length)), opts.extensions);
		if (file) files.push(file);
	}
	for (const name of servedPackages) {
		if (!runtimePackages.has(name) || isExcludedSpecifier(name, NS_OPTIMIZE_DEPS_EXCLUDE)) continue;
		const dir = opts.packageDirs?.[name] ?? findPackageInNodeModules(name, projectRoot);
		const file = dir && resolvePackageEntryFile(dir, platform, opts.extensions);
		if (file) files.push(file);
	}
	const entries = [...new Set(files.filter((f) => existsSync(f)).map((f) => toEntryPattern(f, projectRoot)))];
	return { entries, include, exclude };
}
