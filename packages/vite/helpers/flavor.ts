// import { defaultConfigs } from '..';
import { getAllDependencies } from './utils.js';

let targetFlavor: string;

/**
 * Seed the flavor singleton from an explicit source of truth — the flavor the
 * user's config declared (e.g. `angularConfig()` → `baseConfig({ flavor:
 * 'angular' })`). Dependency-based detection reads only the project's OWN
 * package.json, which misses hoisted framework packages in monorepos (an Nx
 * app depending on a root-level `@nativescript/angular` detects as
 * 'javascript'). A wrong flavor silently disables flavor-gated build steps —
 * most critically the deps-bundle Angular linker, leaving `ɵɵngDeclare*`
 * partial declarations unlinked and crashing at runtime with "needs to be
 * compiled using the JIT compiler" the first time such a factory is pulled
 * (observed with `_PlatformLocation` during an HMR reboot).
 */
export function setProjectFlavor(flavor: string): void {
	if (flavor) {
		targetFlavor = flavor;
	}
}

export function getProjectFlavor(): string {
	if (!targetFlavor) {
		const detectedFlavor = determineProjectFlavor();
		if (detectedFlavor) {
			targetFlavor = detectedFlavor;
		} else {
			targetFlavor = 'javascript'; // default to javascript if undetectable
		}
	}
	return targetFlavor;
}
/**
 * Utility to determine the project flavor based on installed dependencies
 * (vue, angular, react, svelete, typescript, javascript...)
 */
export function determineProjectFlavor(): string | false {
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

	if (dependencies.includes('@nativescript-community/solid-js') || dependencies.includes('solid-js')) {
		return 'solid';
	}

	if (dependencies.includes('svelte-native') || dependencies.includes('@nativescript-community/svelte-native')) {
		return 'svelte';
	}

	// the order is important - angular, react, and svelte also include these deps
	// but should return prior to this condition!
	if (dependencies.includes('@nativescript/core') && dependencies.includes('typescript')) {
		return 'typescript';
	}

	if (dependencies.includes('@nativescript/core')) {
		return 'javascript';
	}

	console.info(`
		Could not determine project flavor.
		Please use the matching <flavor>Config helper from '@nativescript/vite' in vite.config.ts to explicitly set the base config.
	`);

	return false;
}
