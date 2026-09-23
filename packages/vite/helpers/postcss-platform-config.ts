import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { findPackageInNodeModules } from './module-resolution.js';

interface PostCssConfigOptions {
	platform: string;
	projectRoot: string;
	themeCoreRoot: string | undefined;
	postcssImport: any; // optional injected plugin factory
}

/**
 * Builds PostCSS configuration with a platform-aware postcss-import fallback.
 *
 * Reality check under Vite 8: whenever the compiled CSS still contains
 * `@import`, Vite UNSHIFTS its own bundled postcss-import ahead of every
 * user plugin in this config — so by the time these plugins run, the import
 * rules have already been inlined (or the build already failed on an
 * unresolvable specifier). Platform-variant rewriting (`foo.css` →
 * `foo.ios.css`) therefore happens BEFORE Vite sees the CSS:
 *   - module pipeline: the `ns-css-platform` plugin's transform hook
 *   - direct `preprocessCSS()` callers: `rewritePlatformCssImports()`
 *     (both in helpers/css-platform-plugin.ts)
 * A previous `ns-postcss-platform-import-rewrite` plugin here duplicated that
 * rewrite at the postcss layer; it was unreachable and has been removed.
 *
 * The postcss-import fallback below is retained as defense-in-depth for
 * preprocessor outputs (sass passes `@import "*.css"` through untouched) in
 * case an app's plugin order ever bypasses Vite's internal inliner.
 */
export function createPostCssConfig(opts: PostCssConfigOptions) {
	const { platform, projectRoot, themeCoreRoot, postcssImport } = opts;
	if (!postcssImport) return './postcss.config.js';
	return {
		plugins: [
			postcssImport({
				resolve(id: string, basedir: string) {
					if (id.startsWith('.') || id.startsWith('/')) {
						const cleanBasedir = basedir ? basedir.split('?')[0] : basedir;
						const abs = path.resolve(cleanBasedir || '', id);
						if (!existsSync(abs) && /\.css$/.test(abs)) {
							const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
							const alt = abs.replace(/\.css$/, platformExt);
							if (existsSync(alt)) return alt;
						}
						return abs;
					}
					if (id.startsWith('nativescript-theme-core/')) {
						const pkgRoot = themeCoreRoot || findPackageInNodeModules('nativescript-theme-core', projectRoot);
						if (!pkgRoot) return id;
						const rel = id.substring('nativescript-theme-core/'.length);
						const target = path.join(pkgRoot, rel);
						if (/^css\/.+\.css$/.test(rel)) {
							const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
							const base = target.replace(/\.css$/, '');
							const alt = base + platformExt;
							if (existsSync(alt)) return alt;
						}
						return target;
					}
					return id;
				},
				load(filename: string) {
					try {
						const clean = filename.split('?')[0];
						if (existsSync(clean)) {
							return readFileSync(clean, 'utf-8');
						}
						if (/\.css$/.test(clean)) {
							const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
							const alt = clean.replace(/\.css$/, platformExt);
							if (existsSync(alt)) {
								return readFileSync(alt, 'utf-8');
							}
						}
					} catch {}
					return undefined as any;
				},
			}),
		],
	};
}
