const vitePreloadDeclaration = 'const __vitePreload = function preload';
const vitePreloadPreamble = /^const scriptRel =[\s\S]*;\s*const assetsURL =[\s\S]*;\s*const seen = \{\};\s*$/;
const nativePreloadImplementation = `const __vitePreload = function preload(baseModule, deps, importerUrl) {
      return baseModule().catch(err => {
        console.error("Dynamic import error:", err);
        throw err;
      });
    }`;

function findClosingBrace(code: string, declarationStart: number) {
	const functionStart = code.indexOf('{', declarationStart);
	if (functionStart === -1) {
		return -1;
	}

	let braceCount = 0;
	for (let i = functionStart; i < code.length; i++) {
		if (code[i] === '{') {
			braceCount++;
		} else if (code[i] === '}') {
			braceCount--;
			if (braceCount === 0) {
				return i;
			}
		}
	}

	return -1;
}

function simplifyVitePreload(code: string) {
	const declarationStart = code.indexOf(vitePreloadDeclaration);
	if (declarationStart === -1) {
		return code;
	}

	const functionEnd = findClosingBrace(code, declarationStart);
	if (functionEnd === -1) {
		return code;
	}

	// Vite emits these browser-only declarations immediately before
	// __vitePreload. Remove them with the function because scriptRel probes the DOM
	// as soon as a development bundle is evaluated.
	const codeBeforeDeclaration = code.slice(0, declarationStart);
	const possiblePreambleStart = codeBeforeDeclaration.lastIndexOf('const scriptRel =');
	const possiblePreamble = codeBeforeDeclaration.slice(possiblePreambleStart);
	const replacementStart = possiblePreambleStart !== -1 && vitePreloadPreamble.test(possiblePreamble) ? possiblePreambleStart : declarationStart;

	return code.slice(0, replacementStart) + nativePreloadImplementation + code.slice(functionEnd + 1);
}

export function transformDynamicImports(code: string) {
	const withNativeImportPaths = code.replace(/import\(['"]\.\/([^'"]*)['"]\)/g, "import('~/$1')");
	return simplifyVitePreload(withNativeImportPaths);
}

// Fix NativeScript dynamic imports by transforming paths and simplifying __vitePreload.
// Vite still emits its browser preload helper when modulePreload is disabled:
// https://github.com/vitejs/vite/issues/13952
export function dynamicImportPlugin() {
	return {
		name: 'nativescript-dynamic-import-fix',
		generateBundle(_options, bundle) {
			for (const chunk of Object.values(bundle) as any) {
				if (chunk.type === 'chunk') {
					chunk.code = transformDynamicImports(chunk.code);
				}
			}
		},
	};
}
