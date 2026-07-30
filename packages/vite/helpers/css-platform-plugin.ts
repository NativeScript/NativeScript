import type { Plugin } from 'vite';
import path from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * Vite plugin: ns-css-platform
 *
 * Provides platform specific CSS resolution. When a generic import fails (foo.css)
 * it will attempt to load foo.android.css or foo.ios.css depending on platform.
 * Also rewrites relative @import specifiers inside CSS files to platform variants
 * when the generic file does not exist but a platform suffixed version does.
 */
export function createPlatformCssPlugin(platform: string): Plugin {
	return {
		name: 'ns-css-platform',
		enforce: 'pre',
		transform(code: string, id: string) {
			const baseId = id.split('?')[0];
			if (!baseId.endsWith('.css') || !code.includes('@import')) return null;
			const dir = path.dirname(baseId);
			const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
			let changed = false;
			// Support @import "foo.css"; @import 'foo.css'; @import url("foo.css"); preserving rest
			const importRegex = /@import\s+(?:url\()?['"]([^'"()]+\.css)['"]\)?/g;
			const newCode = code.replace(importRegex, (full, spec) => {
				if (/^(https?:|data:)/.test(spec) || spec.includes('nativescript-theme-core') || spec.endsWith(platformExt)) return full;
				if (!(spec.startsWith('.') || spec.startsWith('/'))) return full;
				const abs = path.isAbsolute(spec) ? spec : path.resolve(dir, spec);
				if (existsSync(abs)) return full;
				const alt = abs.replace(/\.css$/, platformExt);
				if (existsSync(alt)) {
					let rel = path.relative(dir, alt).replace(/\\/g, '/');
					if (!rel.startsWith('.')) rel = './' + rel;
					changed = true;
					return full.replace(spec, rel);
				}
				return full;
			});
			return changed ? { code: newCode, map: null } : null;
		},
		resolveId(id: string, importer: string | undefined) {
			if (!id || !importer) return null;
			if (!(id.startsWith('.') || id.startsWith('/'))) return null;
			if (!/\.css$/.test(id)) return null;
			const importerPath = importer.split('?')[0];
			const baseDir = path.dirname(importerPath);
			const abs = path.isAbsolute(id) ? id : path.resolve(baseDir, id);
			if (existsSync(abs)) return null;
			const platformExt = platform === 'android' ? '.android.css' : '.ios.css';
			const alt = abs.replace(/\.css$/, platformExt);
			if (existsSync(alt)) {
				return '\0ns-css-platform:' + alt;
			}
			return null;
		},
		load(id: string) {
			if (!id.startsWith('\0ns-css-platform:')) return null;
			const real = id.substring('\0ns-css-platform:'.length);
			try {
				return readFileSync(real, 'utf-8');
			} catch {
				return '';
			}
		},
	};
}
