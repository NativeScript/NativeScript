export function dynamicImportLoaderFactory() {
	let importESM;

	try {
		importESM = new Function('id', 'return import(id);');
	} catch (e) {
		importESM = null;
	}

	return importESM;
}

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
