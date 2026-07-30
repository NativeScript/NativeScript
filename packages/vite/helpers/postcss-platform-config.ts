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
 * Builds PostCSS configuration with platform import rewriting + postcss-import fallback.
 */
export function createPostCssConfig(opts: PostCssConfigOptions) {
	const { platform, projectRoot, themeCoreRoot, postcssImport } = opts;
	if (!postcssImport) return './postcss.config.js';
	return {
		plugins: [
			{
				postcssPlugin: 'ns-postcss-platform-import-rewrite',
				Once(root: any) {
					try {
						const currentFile: string | undefined = root?.source?.input?.file;
						if (!currentFile) return;
						const currentDir = path.dirname(currentFile);
						root.walkAtRules('import', (rule: any) => {
							const m = /^\s*(?:url\()?["]?([^"')]+)["]?\)?/.exec(rule.params || '');
							if (!m) return;
							const spec = m[1];
							if (!spec || !(spec.startsWith('.') || spec.startsWith('/'))) return;
							if (!spec.endsWith('.css')) return;
							const abs = path.isAbsolute(spec) ? spec : path.resolve(currentDir, spec);
							if (existsSync(abs)) return;
							const ext = platform === 'android' ? '.android.css' : '.ios.css';
							const alt = abs.replace(/\.css$/, ext);
							if (existsSync(alt)) {
								let rel = path.relative(currentDir, alt).replace(/\\/g, '/');
								if (!rel.startsWith('.')) rel = './' + rel;
								rule.params = (rule.params as string).replace(spec, rel);
							}
						});
					} catch {}
				},
			},
			postcssImport({
				resolve(id: string, basedir: string) {
					if (id.startsWith('.') || id.startsWith('/')) {
						const cleanBasedir = basedir ? basedir.split('?')[0] : basedir;
						let abs = path.resolve(cleanBasedir || '', id);
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
						let rel = id.substring('nativescript-theme-core/'.length);
						let target = path.join(pkgRoot, rel);
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
