import { defaultConfigs } from '@akylas/nativescript-webpack';
import { getAllDependencies } from './dependencies';
import { error } from './log';

/**
 * Utility to determine the project flavor based on installed dependencies
 * (vue, angular, react, svelete, typescript, javascript...)
 */
export function projectUsesCustomFlavor(): boolean {
	const dependencies = getAllDependencies();
	return [
		'vue',
		'angular',
		'react',
		'svelte',
		//@ts-ignore
	].includes(determineProjectFlavor());
	if (
		dependencies.includes('nativescript-vue') ||
		dependencies.includes('@nativescript/angular') ||
		dependencies.includes('react-nativescript') ||
		dependencies.includes('svelte-native')
	) {
		return true;
	}

	return false;
}
/**
 * Utility to determine the project flavor based on installed dependencies
 * (vue, angular, react, svelete, typescript, javascript...)
 */
export function determineProjectFlavor(): keyof typeof defaultConfigs | false {
	const dependencies = getAllDependencies();

	if (dependencies.includes('nativescript-vue')) {
		return 'vue';
	}

	if (dependencies.includes('@nativescript/angular')) {
		return 'angular';
	}

	if (dependencies.includes('react-nativescript')) {
		return 'react';
	}

	if (dependencies.includes('svelte-native')) {
		return 'svelte';
	}

	// the order is important - angular, react, and svelte also include these deps
	// but should return prior to this condition!
	if (
		dependencies.includes('@nativescript/core') &&
		dependencies.includes('typescript')
	) {
		return 'typescript';
	}

	if (dependencies.includes('@nativescript/core')) {
		return 'javascript';
	}

	error(`
		Could not determine project flavor.
		Please use webpack.useConfig('<flavor>') to explicitly set the base config.
	`);

	return false;
}
