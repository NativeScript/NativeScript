import type { IWebpackEnv } from '..';

function isTruthyProcessEnvFlag(value: string | undefined): boolean {
	if (value === undefined) {
		return false;
	}

	return value !== '0' && value.toLowerCase() !== 'false';
}

export function isNativeClassTransformerDisabled(env: IWebpackEnv): boolean {
	if (env.disableNativeClassTransformer !== undefined) {
		return !!env.disableNativeClassTransformer;
	}

	if (env.disableNativeTransformer !== undefined) {
		return !!env.disableNativeTransformer;
	}

	return isTruthyProcessEnvFlag(
		process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER,
	);
}
