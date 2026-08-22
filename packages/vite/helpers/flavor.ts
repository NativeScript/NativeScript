import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { getAllDependencies } from './utils.js';
import { findMonorepoWorkspaceRoot, getProjectRootPath } from './project.js';

/**
 * A flavor declared by a framework package in its own package.json:
 *
 *   "nativescript": { "vite": { "flavor": "octane", "config": { "import": "octaneConfig", "from": "@nativescript/vite-octane" } } }
 *
 * The dependency that carries it identifies the flavor for detection, and
 * `config` tells `nativescript-vite init` which helper to scaffold.
 */
export interface DeclaredViteFlavor {
	flavor: string;
	package: string;
	config?: { import: string; from: string };
}

function readDeclaredViteFlavor(dependency: string): DeclaredViteFlavor | null {
	const projectRoot = getProjectRootPath();
	const roots = [projectRoot, findMonorepoWorkspaceRoot(projectRoot)].filter((root): root is string => !!root);
	for (const root of roots) {
		const manifest = path.join(root, 'node_modules', dependency, 'package.json');
		if (!existsSync(manifest)) continue;
		try {
			const vite = JSON.parse(readFileSync(manifest, 'utf8'))?.nativescript?.vite;
			if (vite && typeof vite.flavor === 'string' && vite.flavor) {
				const config = vite.config && typeof vite.config.import === 'string' && typeof vite.config.from === 'string' ? { import: vite.config.import, from: vite.config.from } : undefined;
				return { flavor: vite.flavor, package: dependency, config };
			}
		} catch {}
		return null;
	}
	return null;
}

/** The first installed dependency that declares a Vite flavor, if any. */
export function findDeclaredViteFlavor(): DeclaredViteFlavor | null {
	for (const dependency of getAllDependencies()) {
		const declared = readDeclaredViteFlavor(dependency);
		if (declared) return declared;
	}
	return null;
}

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

	const declared = findDeclaredViteFlavor();
	if (declared) {
		return declared.flavor;
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
		Please use the matching <flavor>Config helper from '@nativescript/vite' in your vite config to explicitly set the base config.
	`);

	return false;
}
