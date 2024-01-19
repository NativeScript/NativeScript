type ModuleLoader = (id: string) => Promise<any>;

/**
 * @internal
 */
function dynamicImportLoaderFactory(): ModuleLoader | null {
	let importESM;

	try {
		importESM = new Function('id', 'return import(id);');
	} catch (e) {
		importESM = null;
	}

	return importESM;
}

/**
 * Utility to interop with both cjs and esm modules, using require() before
 * falling back to import() in case the target is an esm module.
 *
 * @param module String
 * @returns
 */
export async function tryRequireThenImport(module: string) {
	let result;

	try {
		result = require(module);
	} catch (error) {
		const dynamicImportLoader = dynamicImportLoaderFactory();
		if (error.code === 'ERR_REQUIRE_ESM' && dynamicImportLoader) {
			result = await dynamicImportLoader(module);
			result = result.default;

			return result;
		}

		throw error;
	}

	// For babel/typescript
	if (result && typeof result === 'object' && 'default' in result) {
		result = result.default || {};
	}

	return result || {};
}
