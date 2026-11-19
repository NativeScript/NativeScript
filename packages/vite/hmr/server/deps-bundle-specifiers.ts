import { existsSync, readdirSync } from 'fs';
import * as path from 'path';

import { QUERY_PATTERN } from './constants.js';
import { getLinkedDependencyRoots, getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { extractRootPackageName } from '../shared/package-classifier.js';

const BUILD_TIME_ONLY_PACKAGE_ROOTS = new Set(['@nativescript/vite', '@nativescript/webpack', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', 'vite', 'webpack', 'esbuild', 'typescript', 'ts-node', 'prettier']);

const BUILD_TIME_ONLY_PACKAGE_PREFIXES = ['@vitejs/', '@rollup/', '@babel/', '@angular-devkit/', '@angular/build', '@analogjs/', 'vite-plugin-'];

function normalizeNodeModulesSpecifier(spec: string): string | null {
	if (!spec) {
		return null;
	}

	const normalized = spec.replace(/\\/g, '/');
	const idx = normalized.lastIndexOf('/node_modules/');
	if (idx === -1) {
		return null;
	}

	let subPath = normalized.slice(idx + '/node_modules/'.length);
	if (!subPath) {
		return null;
	}

	subPath = subPath.replace(QUERY_PATTERN, '');

	if (!subPath) {
		return null;
	}

	if (subPath.startsWith('.vite/')) {
		return null;
	}

	return subPath.startsWith('/') ? subPath.slice(1) : subPath;
}

function isBuildTimeOnlyPackageRoot(root: string): boolean {
	if (!root) return false;
	if (BUILD_TIME_ONLY_PACKAGE_ROOTS.has(root)) return true;
	return BUILD_TIME_ONLY_PACKAGE_PREFIXES.some((prefix) => root.startsWith(prefix));
}

function isAllowedNativeScriptViteDeviceSubpath(spec: string): boolean {
	const cleaned = spec.replace(QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const pkgName = extractRootPackageName(normalized) || normalized;
	if (pkgName !== '@nativescript/vite') {
		return true;
	}

	const subpath = normalized.slice(pkgName.length).replace(/^\/+/, '');
	if (!subpath) {
		return false;
	}

	return subpath === 'hmr/entry-runtime.js' || subpath.startsWith('hmr/client/') || /^hmr\/frameworks\/[^/]+\/client\//.test(subpath) || subpath.startsWith('hmr/shared/runtime/') || subpath.startsWith('shims/') || subpath === 'runtime/core-aliases-early.js' || subpath === 'polyfills/module.js';
}

/**
 * Why a bare or `/node_modules/…` specifier must never run on the device
 * (build tooling such as `vite` or `@nativescript/vite`'s configuration
 * modules), or `null` when it may.
 */
export function getBlockedDeviceNodeModulesReason(spec: string): string | null {
	if (!spec) return null;

	const cleaned = spec.replace(QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const pkgName = extractRootPackageName(normalized) || normalized;
	if (!pkgName) {
		return null;
	}

	if (pkgName === '@nativescript/vite') {
		if (isAllowedNativeScriptViteDeviceSubpath(normalized)) {
			return null;
		}

		const subpath = normalized.slice(pkgName.length).replace(/^\/+/, '');
		return subpath ? `build-time NativeScript Vite module is not device-loadable: ${pkgName}/${subpath}` : 'build-time NativeScript Vite package root is not device-loadable';
	}

	if (isBuildTimeOnlyPackageRoot(pkgName)) {
		return `build-time package is not device-loadable: ${pkgName}`;
	}

	return null;
}

const workspaceNodeModulesDirsCache = new Map<string, string[]>();

/**
 * `node_modules` dirs that can hold a package the candidate path no longer
 * anchors: pnpm's hoisted virtual-store dir first, then every workspace
 * package's private `node_modules` (one group level deep, e.g.
 * `<ws>/packages/<pkg>/node_modules`). Cached per workspace root; the set
 * only changes on install.
 */
function listWorkspaceNodeModulesDirs(workspaceRoot: string): string[] {
	const cached = workspaceNodeModulesDirsCache.get(workspaceRoot);
	if (cached) {
		return cached;
	}
	const dirs: string[] = [];
	const pushIfPresent = (dir: string) => {
		if (existsSync(dir)) dirs.push(dir);
	};
	const listSubdirs = (dir: string): string[] => {
		try {
			return readdirSync(dir, { withFileTypes: true })
				.filter((entry) => entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.'))
				.map((entry) => path.join(dir, entry.name));
		} catch {
			return [];
		}
	};
	pushIfPresent(path.join(workspaceRoot, 'node_modules', '.pnpm', 'node_modules'));
	for (const groupDir of listSubdirs(workspaceRoot)) {
		pushIfPresent(path.join(groupDir, 'node_modules'));
		for (const packageDir of listSubdirs(groupDir)) {
			pushIfPresent(path.join(packageDir, 'node_modules'));
		}
	}
	workspaceNodeModulesDirsCache.set(workspaceRoot, dirs);
	return dirs;
}

const linkedDependencyNodeModulesDirsCache = new Map<string, string[]>();

/**
 * `node_modules` dirs reachable through the app's dependency specs rather
 * than its workspace layout — consulted when neither the project root nor
 * the workspace root can anchor a `/node_modules/` tail. Linked source
 * checkouts (`link:`/`file:`/`portal:` deps and install-time hook symlinks)
 * keep their own `node_modules` at the real target, and their workspace
 * siblings can own transitive deps too, so each linked root's detected
 * workspace root is scanned with the existing bounded workspace scan.
 * Cached per project root; the set only changes on install.
 */
function listLinkedDependencyNodeModulesDirs(projectRoot: string): string[] {
	const key = path.resolve(projectRoot);
	const cached = linkedDependencyNodeModulesDirsCache.get(key);
	if (cached) {
		return cached;
	}
	const dirs: string[] = [];
	const seen = new Set<string>();
	const pushIfPresent = (dir: string) => {
		if (!seen.has(dir) && existsSync(dir)) {
			seen.add(dir);
			dirs.push(dir);
		}
	};
	const linkedWorkspaces = new Set<string>();
	// Direct deps precede their workspace scans: the candidate carries no
	// importer, so first hit wins.
	for (const root of getLinkedDependencyRoots(key)) {
		pushIfPresent(path.join(root, 'node_modules'));
		const workspace = getMonorepoWorkspaceRoot(root);
		if (workspace) {
			linkedWorkspaces.add(workspace);
		}
	}
	for (const workspace of linkedWorkspaces) {
		pushIfPresent(path.join(workspace, 'node_modules'));
		for (const dir of listWorkspaceNodeModulesDirs(workspace)) {
			pushIfPresent(dir);
		}
	}
	linkedDependencyNodeModulesDirsCache.set(key, dirs);
	return dirs;
}

/**
 * Resolve a candidate path ('/node_modules/...', '/@fs/...', or an
 * absolute fs path) to a real file on disk under one of the allowed
 * roots, returning the absolute fs path or `null`.
 *
 * `workspaceRoot` is consulted ONLY when the candidate cannot be
 * resolved under `projectRoot`, as a fallback for monorepos where
 * `node_modules/` is hoisted above the app dir (Nx, Rush, Turborepo,
 * etc.). Linked dependency checkouts (`link:`/`file:`/`portal:` deps and
 * install-time hook symlinks) are probed last, by the same
 * `/node_modules/<pkg>/...` tail, since their private `node_modules`
 * live under neither root.
 */
export function resolveCandidateFilePath(candidate: string, projectRoot: string, workspaceRoot?: string | null): string | null {
	const cleaned = candidate.replace(QUERY_PATTERN, '');
	if (!cleaned) return null;

	const tryUnderRoot = (root: string): string | null => {
		const resolvedRoot = path.resolve(root);
		let absPath: string | null = null;

		if (cleaned.startsWith('/@fs/')) {
			absPath = cleaned.slice('/@fs'.length);
		} else if (cleaned.includes('/node_modules/')) {
			absPath = path.resolve(resolvedRoot, `.${cleaned}`);
		} else if (/^(?:[A-Za-z]:)?\//.test(cleaned)) {
			absPath = path.resolve(cleaned);
		}

		if (!absPath) {
			return null;
		}

		const rel = path.relative(resolvedRoot, absPath);
		if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
			return null;
		}

		return existsSync(absPath) ? absPath : null;
	};

	const fromProjectRoot = tryUnderRoot(projectRoot);
	if (fromProjectRoot) return fromProjectRoot;

	// Only the last `/node_modules/<pkg>/...` tail is kept, so a package
	// installed solely in a fallback `node_modules` dir has no root to resolve
	// under. First hit wins: the candidate carries no importer.
	const probeNodeModulesTail = (nmDirs: string[]): string | null => {
		if (!cleaned.includes('/node_modules/')) {
			return null;
		}
		const tail = cleaned.slice(cleaned.lastIndexOf('/node_modules/') + '/node_modules/'.length);
		for (const nmDir of nmDirs) {
			const absPath = path.resolve(nmDir, tail);
			if (absPath.startsWith(nmDir + path.sep) && existsSync(absPath)) {
				return absPath;
			}
		}
		return null;
	};

	if (workspaceRoot) {
		const resolvedProject = path.resolve(projectRoot);
		const resolvedWorkspace = path.resolve(workspaceRoot);
		if (resolvedWorkspace !== resolvedProject) {
			const fromWorkspace = tryUnderRoot(resolvedWorkspace);
			if (fromWorkspace) return fromWorkspace;

			// A package installed solely in the pnpm store or in a workspace
			// package's private node_modules.
			const fromWorkspaceScan = probeNodeModulesTail(listWorkspaceNodeModulesDirs(resolvedWorkspace));
			if (fromWorkspaceScan) return fromWorkspaceScan;
		}
	}

	// Linked source checkouts keep private node_modules outside both roots.
	// Only packages the app's own install lacks may come from them: each
	// extension/index variant is resolved separately, so a variant missing
	// from the app's copy would otherwise pull in a checkout's other copy.
	if (cleaned.includes('/node_modules/')) {
		const tail = cleaned.slice(cleaned.lastIndexOf('/node_modules/') + '/node_modules/'.length);
		const pkgName = extractRootPackageName(tail);
		const installedForApp =
			!!pkgName &&
			[projectRoot, workspaceRoot].some((root) => {
				if (!root) return false;
				const nodeModules = path.join(path.resolve(root), 'node_modules');
				return existsSync(path.join(nodeModules, pkgName)) || existsSync(path.join(nodeModules, '.pnpm', 'node_modules', pkgName));
			});
		if (!installedForApp) {
			const fromLinkedDeps = probeNodeModulesTail(listLinkedDependencyNodeModulesDirs(projectRoot));
			if (fromLinkedDeps) return fromLinkedDeps;
		}
	}

	return null;
}
