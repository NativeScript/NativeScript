import type { Plugin } from 'vite';
import { transformNativeClassSource } from './nativeclass-transform.js';

/**
 * Wraps NativeClass TS transformer into a Vite plugin.
 */
export function createNativeClassTransformerPlugin(): Plugin {
	const verbose = !!process.env.NS_DEBUG_NATIVECLASS;

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

			// Check if this file has @NativeClass BEFORE transforming (for debug)
			const hasNativeClass = code.includes('@NativeClass') || code.includes('NativeClass');
			if (verbose && hasNativeClass) {
				console.log(`[ns-nativeclass] Processing file with NativeClass: ${bareId}`);
			}

			const res = transformNativeClassSource(code, bareId);

			// Verify the transform removed NativeClass
			if (verbose && hasNativeClass) {
				if (res) {
					const stillHas = /\bNativeClass\b/.test(res.code);
					if (stillHas) {
						console.warn(`[ns-nativeclass] WARNING: NativeClass still present after transform in ${bareId}`);
					} else {
						console.log(`[ns-nativeclass] Successfully transformed ${bareId}`);
					}
				} else {
					console.log(`[ns-nativeclass] Transform returned null for ${bareId} (may be skipped due to platform filter)`);
				}
			}

			return res; // may be null if no @NativeClass present
		},
	};
}
