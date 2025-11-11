import type { Plugin } from 'vite';
import { transformNativeClassSource } from './nativeclass-transform.js';

/**
 * Wraps NativeClass TS transformer into a Vite plugin.
 */
export function createNativeClassTransformerPlugin(): Plugin {
	return {
		name: 'ns-nativeclass-transformer',
		enforce: 'pre',
		async transform(code: string, id: string) {
			if (!code) return null;
			const bareId = id.split('?')[0];
			const isTSFile = /\.(ts|tsx)$/.test(bareId);
			const isJSFile = /\.(js|mjs|cjs)$/.test(bareId);
			const isVueTSBlock = !isTSFile && /[?&]lang\.(ts|tsx)\b/.test(id);
			if (!isTSFile && !isVueTSBlock && !isJSFile) return null;
			const res = transformNativeClassSource(code, bareId);
			return res; // may be null if no @NativeClass present
		},
	};
}
