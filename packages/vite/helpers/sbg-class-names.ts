import type { Plugin } from 'vite';

/**
 * The Android static binding generator reads the class name given to `extend('name', {...})` or
 * `JavaProxy('name')` only from a quoted string literal, while the minifier prints every string
 * as a template literal. A name it cannot read is left for the runtime to generate at launch,
 * which only works where dex injection into the app class loader succeeds.
 */
const NAMED_BINDING = /\b(extend|JavaProxy)\(`((?:[^`\\"$]|\$(?!\{))*)`/g;

/** Requotes binding names as double-quoted strings; same length, so source maps still line up. */
export function quoteBindingNames(code: string): string {
	return code.replace(NAMED_BINDING, '$1("$2"');
}

/** Runs on the finished chunks, after minification has printed them. */
export function sbgClassNamesPlugin(): Plugin {
	return {
		name: 'ns-sbg-class-names',
		apply: 'build',
		enforce: 'post',
		generateBundle(_options, bundle) {
			for (const output of Object.values(bundle)) {
				if (output.type === 'chunk') {
					output.code = quoteBindingNames(output.code);
				}
			}
		},
	};
}
