import type { Plugin } from 'vite';

// Build-time patch: ensure vendor.mjs's bundled ModuleRunner.getModuleInformation
// always receives a valid options object with a cache to prevent
// "Cannot use 'in' operator to search for 'cache' in undefined".
export function moduleRunnerPatchPlugin(): Plugin {
	return {
		name: 'ns-module-runner-patch',
		apply: 'build',
		enforce: 'post',
		generateBundle(_opts, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (fileName !== 'vendor.mjs') continue;
				if (chunk.type !== 'chunk' || typeof chunk.code !== 'string') continue;
				let code = chunk.code as string;

				// Try to locate the function definition (non-minified dev build keeps names)
				// Handle both forms: function getModuleInformation(id, options) { ... }
				// and class method or object method: getModuleInformation(id, options) { ... }
				const patterns: RegExp[] = [/function\s+getModuleInformation\s*\(([^)]*)\)\s*\{/, /getModuleInformation\s*\(([^)]*)\)\s*\{/];

				let replaced = false;
				for (const re of patterns) {
					const m = re.exec(code);
					if (!m) continue;
					const rawParams = (m[1] || '')
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean);
					const idParam = rawParams[0];
					const second = rawParams[1];
					const third = rawParams[2];
					let guard = '\n';
					if (third && second) {
						// Signature: (id, importer, options)
						guard += `if (typeof ${second} !== 'string') ${second} = undefined;\n`;
						guard += `${third} = ${third} && typeof ${third}==='object' ? ${third} : {};\n`;
						guard += `if (!('cache' in ${third})) ${third}.cache = new Map();\n`;
					} else if (second) {
						// Signature: (id, options)
						guard += `${second} = ${second} && typeof ${second}==='object' ? ${second} : {};\n`;
						guard += `if (!('cache' in ${second})) ${second}.cache = new Map();\n`;
					} else {
						// Unknown/minified: use arguments[] positions
						guard += `(function(){ try{ var __imp = arguments[1]; if (typeof __imp !== 'string') arguments[1] = undefined; } catch(_){} })();\n`;
						guard += `(function(){ try{ var __o = arguments[2] ?? arguments[1]; if (!__o || typeof __o!=='object') { __o = {}; if (arguments.length>2) arguments[2]=__o; else arguments[1]=__o; } if (!('cache' in __o)) __o.cache = new Map(); } catch(_){} })();\n`;
					}

					// Inject guard right after the opening brace of the function
					const start = m.index + m[0].length;
					code = code.slice(0, start) + guard + code.slice(start);
					replaced = true;
					break;
				}

				if (replaced) {
					(chunk as any).code = code;
				}
			}
		},
	};
}

export default moduleRunnerPatchPlugin;
