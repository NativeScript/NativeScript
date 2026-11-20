import type { Plugin } from 'vite';

const PARTIAL_DECLARATION = 'ɵɵngDeclare';
// Same exclusion as Angular's own linker check: these define the partial functions.
const DEFINES_PARTIAL_FUNCTIONS = /[\\/]@angular[\\/](?:compiler|core)[\\/]/;
const JS_ID = /\.[cm]?js(?:\?|$)/;

/**
 * Fails the build when a bundled module still holds Angular partial declarations.
 * Analog links `fesm*` files (its build plugin, its dev-server plugin and the dep
 * optimizer); partials elsewhere load through the JIT compiler in dev, which
 * release builds don't ship.
 * @returns A build-only Vite plugin.
 */
export function angularUnlinkedPartialsGuardPlugin(): Plugin {
	const unlinked = new Set<string>();
	return {
		name: 'ns-angular-unlinked-partials-guard',
		apply: 'build',
		enforce: 'post',
		buildStart() {
			unlinked.clear();
		},
		transform: {
			filter: { id: JS_ID, code: PARTIAL_DECLARATION },
			handler(_code, id) {
				if (!DEFINES_PARTIAL_FUNCTIONS.test(id)) unlinked.add(id);
				return null;
			},
		},
		generateBundle(_options, bundle) {
			const offenders = new Set<string>();
			for (const output of Object.values(bundle)) {
				if (output.type !== 'chunk') continue;
				for (const moduleId of output.moduleIds) {
					if (unlinked.has(moduleId)) offenders.add(moduleId);
				}
			}
			if (!offenders.size) return;
			this.error(`Angular partial declarations (${PARTIAL_DECLARATION}*) were not linked in:\n${[...offenders].map((id) => `  ${id}`).join('\n')}\nThe app would need the JIT compiler at runtime. The Analog plugin links only files under a fesm20xx directory, the Angular Package Format layout.`);
		},
	};
}
