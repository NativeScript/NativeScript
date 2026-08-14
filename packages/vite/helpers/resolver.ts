import type { Plugin } from 'vite';
import path from 'path';
import { resolveNativeScriptPlatformFile } from './utils.js';
import { normalizeModuleId } from './normalize-id.js';

const normalizeImporterId = (importer: string): string => {
	const cleanImporter = importer.split('?', 1)[0];

	if (!cleanImporter.startsWith('/@fs/')) {
		return cleanImporter;
	}

	return /^\/\@fs\/[A-Za-z]:/.test(cleanImporter) ? cleanImporter.slice('/@fs/'.length) : cleanImporter.slice('/@fs'.length);
};

export default function NativeScriptPlugin(options: { platform: 'ios' | 'android' | 'visionos' }): Plugin {
	return {
		name: 'vite:nativescript',
		enforce: 'pre',

		resolveId(source, importer) {
			const platform = options.platform;
			if (!platform || !importer || source.startsWith('.') === false) {
				return null;
			}

			const resolved = path.resolve(path.dirname(normalizeImporterId(importer)), source);
			const extVariants = ['.ts', '.js'];

			for (const ext of extVariants) {
				const file = resolveNativeScriptPlatformFile(resolved + ext, platform);
				if (file) {
					// Canonicalize before handing the id to Rolldown. `path.resolve`
					// emits backslashes on Windows; the @nativescript/core alias and
					// Vite's own resolver emit forward slashes. Returning the raw
					// backslash form here makes Rolldown treat the same core file as a
					// second module, double-evaluating widthProperty.register. No-op on
					// POSIX. See normalize-id.ts for the full rationale.
					return normalizeModuleId(file);
				}
			}

			return null;
		},

		transform(code, id) {
			if (id.endsWith('.xml')) {
				// Example: simple pass-through or custom transform for NativeScript view files
				return {
					code,
					map: null,
				};
			}
		},
	};
}
