import path from 'path';
import { nsConfigToJson, resolveNativeScriptPlatformFile } from './utils.js';

export function getWorkerPlugins(platform: string) {
	return [
		// Handle ~/package.json virtual module for workers
		{
			name: 'worker-virtual-package-json',
			resolveId(id) {
				if (id === '~/package.json') {
					return '\0worker:nsconfig-json'; // Use a completely different virtual ID that doesn't look like JSON
				}
				return null;
			},
			load(id) {
				if (id === '\0worker:nsconfig-json') {
					const configObject = nsConfigToJson();
					// Return the NativeScript config as a JavaScript module
					return `export default ${JSON.stringify(configObject, null, 2)};`;
				}
				return null;
			},
		},
		// Resolve NativeScript platform-specific files for workers
		{
			name: 'nativescript-platform-resolver-worker',
			resolveId(id, importer) {
				// Handle relative imports from node_modules (not just @nativescript/core)
				if (importer) {
					const resolvedPath = path.resolve(path.dirname(importer), id);

					// Try different extensions with platform-specific resolution
					const extensions = ['.js', '.mjs', '.ts'];

					for (const ext of extensions) {
						const testPath = resolvedPath + ext;
						// Use the existing NativeScript platform file resolver
						const platformResolvedFile = resolveNativeScriptPlatformFile(testPath, platform);
						if (platformResolvedFile) {
							return platformResolvedFile;
						}
					}

					return null;
				}
				return null;
			},
		},
		// Handle import.meta expressions in workers
		{
			name: 'worker-import-meta-handler',
			transform(code, id) {
				// Replace import.meta.dirname with a static value for workers
				if (code.includes('import.meta.dirname')) {
					code = code.replace(/import\.meta\.dirname/g, '""');
				}
				// Replace import.meta.url with a static value for workers
				if (code.includes('import.meta.url')) {
					code = code.replace(/import\.meta\.url/g, '"file:///app/"');
				}
				return code;
			},
		},
	];
}

export function workerUrlPlugin() {
	return {
		name: 'nativescript-worker-url-transform',
		generateBundle(options, bundle) {
			// Transform the main bundle to use NativeScript worker paths
			for (const [fileName, chunk] of Object.entries(bundle) as any) {
				if (chunk.type === 'chunk' && !fileName.includes('.worker')) {
					// Transform Vite's worker URL pattern to NativeScript's expected format
					// From: new Worker(new URL(/* @vite-ignore */ "/assets/sample.worker-C6wW8q2-.js", import.meta.url))
					// To: new Worker('~/' + 'assets/sample.worker-C6wW8q2-.js')
					const workerUrlRegex = /new\s+Worker\s*\(\s*new\s+URL\s*\(\s*(?:\/\*[^*]*\*\/\s*)?["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)\s*\)/g;

					if (workerUrlRegex.test(chunk.code)) {
						chunk.code = chunk.code.replace(workerUrlRegex, (match, assetPath) => {
							// Use the full asset path including assets/ folder
							const fullPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
							return `new Worker('~/' + '${fullPath}')`;
						});
					}
				}
			}
		},
	};
}
