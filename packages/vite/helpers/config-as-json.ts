import type { Plugin } from 'vite';
import { nsConfigToJson } from './utils.js';

const nsConfigVirtualId = '\0nsvite:nsconfig-json';

export default function nsConfigAsJsonPlugin(): Plugin {
	// will hold your parsed config object
	let configObject: Record<string, any>;

	return {
		name: 'nsvite-nsconfig-as-json',

		// 1. Intercept imports of "~/package.json"
		resolveId(source) {
			if (source === '~/package.json') {
				return nsConfigVirtualId;
			}
			return null;
		},

		// 2. When Vite asks us to load that virtual ID...
		load(id) {
			if (id === nsConfigVirtualId) {
				configObject = nsConfigToJson();

				// c) Return an ESM wrapper so Vite can import it at build‑time
				return `export default ${JSON.stringify(configObject)};`;
			}
			return null;
		},

		// 3. After Rollup has generated all chunks, emit a package.json asset
		//    into the output directory (dist/ by default)
		generateBundle(_options, _bundle) {
			const json = JSON.stringify(configObject, null, 2);
			this.emitFile({
				type: 'asset',
				fileName: 'package.json',
				source: json,
			});
		},
	};
}
