/**
 * Polyfill for Node.js 'module' built-in
 * Provides minimal implementation for NativeScript environment
 */

// Mock createRequire function that css-tree uses
function createRequire(filename: string) {
	// Return a mock require function
	return function mockRequire(id: string) {
		// Handle css-tree's internal patch.json file
		if (id.includes('../data/patch.json') || id.includes('patch.json')) {
			// Return css-tree's patch structure
			return {
				atrules: {},
				properties: {},
				types: {},
			};
		}

		// For mdn-data files, return empty objects
		if (id.includes('mdn-data')) {
			return {};
		}

		// For any other requires, return empty object
		return {};
	};
}

// CommonJS export
module.exports = {
	createRequire: createRequire,
};

// Provide a named export for ESM consumers: `import { createRequire } from 'module'`
try {
	Object.defineProperty(module.exports, 'createRequire', {
		enumerable: true,
		value: createRequire,
	});
	// Also export under an __esModule flag for certain bundlers
	Object.defineProperty(module.exports, '__esModule', {
		value: true,
	});
} catch (e) {
	// ignore in environments where defineProperty is unavailable
}
