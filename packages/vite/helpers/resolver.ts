import type { Plugin } from 'vite';
import path from 'path';
import { resolveNativeScriptPlatformFile } from './utils.js';

export default function NativeScriptPlugin(options: { platform: 'ios' | 'android' | 'visionos' }): Plugin {
	return {
		name: 'vite:nativescript',

		resolveId(source, importer) {
			const platform = options.platform;
			if (!platform || !importer || source.startsWith('.') === false) {
				return null;
			}

			const resolved = path.resolve(path.dirname(importer), source);
			const extVariants = ['.ts', '.js'];

			for (const ext of extVariants) {
				const file = resolveNativeScriptPlatformFile(resolved + ext, platform);
				if (file) {
					return file;
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
