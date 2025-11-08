import type { Plugin } from 'vite';
import path from 'path';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, symlinkSync } from 'fs';
import { findPackageInNodeModules } from './module-resolution.js';

/**
 * Return theme core generic CSS alias list converting imports like
 * nativescript-theme-core/css/core.light.css -> platform specific variant when available.
 */
export function getThemeCoreGenericAliases(themeCoreRoot: string | undefined, platform: string): any[] {
	if (!themeCoreRoot) return [];
	const cssDir = path.join(themeCoreRoot, 'css');
	if (!existsSync(cssDir)) return [];
	const entries = readdirSync(cssDir);
	const bases = new Set<string>();
	for (const file of entries) {
		const m = file.match(/^(.*)\.(android|ios)\.css$/);
		if (m) bases.add(m[1]);
	}
	const platformSuffix = platform === 'android' ? '.android.css' : '.ios.css';
	return Array.from(bases).map((base) => {
		const replacement = path.join(cssDir, base + platformSuffix);
		return {
			find: new RegExp(`^nativescript-theme-core\/css\/${base}\.css$`),
			replacement,
		};
	});
}

/**
 * Ensures hoisted theme-core is linked into app local node_modules and creates generic -> platform symlinks.
 */
export function createEnsureHoistedThemeLinkPlugin(themeCoreRoot: string | undefined, projectRoot: string, platform: string): Plugin | undefined {
	if (!themeCoreRoot) return undefined;
	return {
		name: 'ns-ensure-hoisted-theme-link',
		enforce: 'pre',
		buildStart() {
			try {
				const appNodeModules = path.join(projectRoot, 'node_modules');
				if (!existsSync(appNodeModules)) {
					mkdirSync(appNodeModules, { recursive: true });
				}
				const linkPath = path.join(appNodeModules, 'nativescript-theme-core');
				const needsLink = !existsSync(linkPath) || !lstatSync(linkPath).isSymbolicLink();
				if (needsLink) {
					try {
						symlinkSync(themeCoreRoot!, linkPath, 'dir' as any);
					} catch {}
				}
				// Create generic css symlinks (core.light.css -> core.light.<platform>.css) if missing
				const cssDir = path.join(linkPath, 'css');
				if (existsSync(cssDir)) {
					const files = readdirSync(cssDir);
					const platformSuffix = platform === 'android' ? '.android.css' : '.ios.css';
					for (const f of files) {
						const m = f.match(/^(.*)\.(android|ios)\.css$/);
						if (!m) continue;
						const base = m[1];
						const generic = path.join(cssDir, base + '.css');
						if (!existsSync(generic)) {
							const platformFile = path.join(cssDir, base + platformSuffix);
							if (existsSync(platformFile)) {
								try {
									symlinkSync(platformFile, generic);
								} catch {}
							}
						}
					}
				}
			} catch {}
		},
	};
}

/**
 * Fallback loader for theme-core CSS when app-local node_modules copy is missing.
 */
export function createThemeCoreCssFallbackPlugin(themeCoreRoot: string | undefined, projectRoot: string, platform: string): Plugin | undefined {
	// Keep behavior: only active when a hoisted root exists
	if (!themeCoreRoot) return undefined;
	return {
		name: 'ns-theme-core-css-fallback',
		enforce: 'pre',
		load(id: string) {
			if (!id.includes('nativescript-theme-core')) return null;
			if (existsSync(id)) return null; // let default loader
			const pkgRoot = themeCoreRoot || findPackageInNodeModules('nativescript-theme-core', projectRoot);
			if (!pkgRoot) return null;
			const idx = id.lastIndexOf('nativescript-theme-core/');
			if (idx === -1) return null;
			const rel = id.substring(idx + 'nativescript-theme-core/'.length);
			let target = path.join(pkgRoot, rel);
			try {
				if (existsSync(target)) {
					return readFileSync(target, 'utf-8');
				}
				if (/\.css$/.test(target)) {
					const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
					const base = target.replace(/\.css$/, '');
					const alt = base + platformExt;
					if (existsSync(alt)) {
						return readFileSync(alt, 'utf-8');
					}
				}
			} catch {}
			return null;
		},
	};
}
