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

module.exports = {
	createRequire: createRequire,
};
