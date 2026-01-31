import type { Plugin as EsbuildPlugin } from 'esbuild';
import { transformNativeClassSource } from './nativeclass-transform.js';

/**
 * Esbuild plugin that applies the NativeClass transformer to TypeScript/JavaScript files.
 * This is needed for vendor bundle generation which uses esbuild directly instead of Vite's
 * transform pipeline.
 */
export function createNativeClassEsbuildPlugin(platform: 'android' | 'ios' | 'visionos'): EsbuildPlugin {
	const verbose = !!process.env.NS_DEBUG_NATIVECLASS;

	return {
		name: 'ns-nativeclass-esbuild',
		setup(build) {
			// We need to use onLoad to transform the file contents
			// Filter to only process .ts and .js files that might contain @NativeClass
			build.onLoad({ filter: /\.(ts|tsx|js|mjs|cjs)$/ }, async (args) => {
				const { readFile } = await import('fs/promises');
				const path = args.path;

				// Skip wrong platform files
				if (path.includes('.android.') && platform !== 'android') {
					return undefined; // Let default loader handle it
				}
				if ((path.includes('.ios.') || path.includes('.visionos.')) && platform === 'android') {
					return undefined; // Let default loader handle it
				}

				// Read the file content
				let contents: string;
				try {
					contents = await readFile(path, 'utf-8');
				} catch {
					return undefined; // Let esbuild handle it
				}

				// Check if file contains @NativeClass or NativeClass
				const hasNativeClass = contents.includes('@NativeClass') || contents.includes('NativeClass');
				if (!hasNativeClass) {
					return undefined; // No transformation needed
				}

				if (verbose) {
					console.log(`[ns-nativeclass-esbuild] Processing file with NativeClass: ${path}`);
				}

				// Apply the NativeClass transformation
				const result = transformNativeClassSource(contents, path);

				if (result) {
					if (verbose) {
						const stillHas = /\bNativeClass\b/.test(result.code);
						if (stillHas) {
							console.warn(`[ns-nativeclass-esbuild] WARNING: NativeClass still present after transform in ${path}`);
						} else {
							console.log(`[ns-nativeclass-esbuild] Successfully transformed ${path}`);
						}
					}

					// Determine the loader based on file extension
					const ext = path.split('.').pop()?.toLowerCase() || 'ts';
					const loader = ext === 'tsx' ? 'tsx' : ext === 'ts' ? 'ts' : 'js';

					return {
						contents: result.code,
						loader: loader,
					};
				}

				// No transformation performed, let default loader handle it
				return undefined;
			});
		},
	};
}
