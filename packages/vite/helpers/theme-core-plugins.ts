import type { Plugin } from 'vite';
import path from 'path';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'fs';
import { findPackageInNodeModules } from './module-resolution.js';
import { PLATFORM_SUFFIX_ALT, platformCssExt } from './platform-types.js';

const PLATFORM_CSS_RE = new RegExp(`^(.*)\\.(?:${PLATFORM_SUFFIX_ALT})\\.css$`);

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
		const m = file.match(PLATFORM_CSS_RE);
		if (m) bases.add(m[1]);
	}
	const platformSuffix = platformCssExt(platform);
	const aliases: any[] = [];
	const missing: string[] = [];
	for (const base of bases) {
		let replacement = path.join(cssDir, base + platformSuffix);
		if (!existsSync(replacement)) {
			// theme-core ships only android/ios variants. Elsewhere (Windows) the generic
			// import would fail the build; resolve it to an empty stylesheet instead of
			// another platform's theme, whose rules don't fit.
			if (platform !== 'windows') continue;
			replacement = emptyStylesheet(themeCoreRoot);
			missing.push(base + '.css');
		}
		aliases.push({ find: new RegExp(`^nativescript-theme-core\/css\/${base}\.css$`), replacement });
	}
	if (missing.length && !warnedMissingThemes) {
		warnedMissingThemes = true;
		console.warn(`[ns-vite] nativescript-theme-core has no ${platformSuffix} variants; imports of ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', …' : ''} resolve to an empty stylesheet on ${platform}.`);
	}
	return aliases;
}

let warnedMissingThemes = false;

/** A real (empty) CSS file: `@import` reads files directly, so a virtual module won't do. */
function emptyStylesheet(themeCoreRoot: string): string {
	const dir = path.join(path.dirname(themeCoreRoot), '.cache', 'nativescript-vite');
	const file = path.join(dir, 'empty-theme.css');
	if (!existsSync(file)) {
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, '/* nativescript-theme-core has no variant for this platform */\n');
	}
	return file;
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
					const platformSuffix = platformCssExt(platform);
					for (const f of files) {
						const m = f.match(PLATFORM_CSS_RE);
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
			const target = path.join(pkgRoot, rel);
			try {
				if (existsSync(target)) {
					return readFileSync(target, 'utf-8');
				}
				if (/\.css$/.test(target)) {
					const platformExt = platformCssExt(platform);
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
