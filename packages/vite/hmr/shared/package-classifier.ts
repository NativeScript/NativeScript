import { readFileSync } from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

export interface PackageRuntimeInfo {
	rootPackageName: string;
	hasPackageJson: boolean;
	hasExports: boolean;
	mainEntries: Set<string>;
	hasNativeScriptMetadata: boolean;
}

const packageRuntimeInfoCache = new Map<string, PackageRuntimeInfo>();

export function extractRootPackageName(spec: string): string {
	if (!spec) return '';
	if (spec.startsWith('@')) {
		const parts = spec.split('/');
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
	}
	return spec.split('/')[0];
}

export function getPackageRuntimeInfo(spec: string, projectRoot: string): PackageRuntimeInfo {
	const rootPackageName = extractRootPackageName(String(spec || ''));
	if (!rootPackageName) {
		return {
			rootPackageName: '',
			hasPackageJson: false,
			hasExports: false,
			mainEntries: new Set<string>(),
			hasNativeScriptMetadata: false,
		};
	}

	const resolvedProjectRoot = path.resolve(projectRoot || process.cwd());
	const cacheKey = `${resolvedProjectRoot}::${rootPackageName}`;
	const cached = packageRuntimeInfoCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const info: PackageRuntimeInfo = {
		rootPackageName,
		hasPackageJson: false,
		hasExports: false,
		mainEntries: new Set<string>(),
		hasNativeScriptMetadata: false,
	};

	try {
		const projectRequire = createRequire(path.join(resolvedProjectRoot, 'package.json'));
		const packageJsonPath = projectRequire.resolve(`${rootPackageName}/package.json`);
		const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
			exports?: unknown;
			main?: string;
			module?: string;
			nativescript?: unknown;
			peerDependencies?: Record<string, string>;
			dependencies?: Record<string, string>;
		};

		info.hasPackageJson = true;
		info.hasExports = !!pkg.exports && typeof pkg.exports === 'object';
		for (const field of ['module', 'main'] as const) {
			const value = pkg[field];
			if (value && typeof value === 'string') {
				info.mainEntries.add(value.replace(/^\.\//, ''));
			}
		}
		info.hasNativeScriptMetadata = (typeof pkg.nativescript === 'object' && pkg.nativescript !== null) || typeof pkg.peerDependencies?.['@nativescript/core'] === 'string' || typeof pkg.dependencies?.['@nativescript/core'] === 'string';
	} catch {
		// Package metadata unavailable — leave defaults and let callers fall back to heuristics.
	}

	packageRuntimeInfoCache.set(cacheKey, info);
	return info;
}
