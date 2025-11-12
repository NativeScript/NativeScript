// Fix NativeScript dynamic imports by transforming paths and simplifying __vitePreload
// Vite auto adds __vitePreload which includes browser APIs we don't need.
// Note: ideally build.modulePreload = false in build settings would fix this
// by simply removing the existence of __vitePreload in the bundle.
// However, this appears to be a known Vite issue: https://github.com/vitejs/vite/issues/13952
// Keep issue in mind for future Vite updates as may be able to remove this eventually.
export function dynamicImportPlugin() {
	return {
		name: 'nativescript-dynamic-import-fix',
		generateBundle(options, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle) as any) {
				if (chunk.type === 'chunk') {
					let hasChanges = false;

					// 1. Transform all relative import paths from ./ to ~/
					if (chunk.code.includes("import('./")) {
						chunk.code = chunk.code.replace(/import\(['"]\.\/([^'"]*)['"]\)/g, "import('~/$1')");
						hasChanges = true;
					}

					// 2. Replace __vitePreload with simple implementation
					if (chunk.code.includes('__vitePreload')) {
						const vitePreloadStart = chunk.code.indexOf('const __vitePreload = function preload');
						if (vitePreloadStart !== -1) {
							// Find the matching closing brace by counting braces
							let braceCount = 0;
							let functionStart = chunk.code.indexOf('{', vitePreloadStart);
							let i = functionStart;

							while (i < chunk.code.length) {
								if (chunk.code[i] === '{') braceCount++;
								else if (chunk.code[i] === '}') {
									braceCount--;
									if (braceCount === 0) {
										// Found the end of the function
										const functionEnd = i + 1;
										const before = chunk.code.substring(0, vitePreloadStart);
										const after = chunk.code.substring(functionEnd);

										// Simple implementation that just calls baseModule()
										const replacement = `const __vitePreload = function preload(baseModule, deps, importerUrl) {
      return baseModule().catch(err => {
        console.error("Dynamic import error:", err);
        throw err;
      });
    }`;
										chunk.code = before + replacement + after;
										hasChanges = true;
										break;
									}
								}
								i++;
							}
						}
					}

					//   if (hasChanges) {
					//     console.log(
					//       `Fixed NativeScript dynamic imports in: ${fileName}`,
					//     );
					//   }
				}
			}
		},
	};
}
