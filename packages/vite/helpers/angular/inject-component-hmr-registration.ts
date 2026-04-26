/**
 * Vite-side helper that injects HMR self-registration calls into the
 * compiled output of user `.ts` files that declare `@Component`-
 * decorated classes.
 *
 * After an HMR reboot, the global `__NS_HMR_REGISTER_COMPONENT__` hook
 * (installed by `@nativescript/angular`) records each fresh class
 * keyed by source name. HMR helpers (modal restore, route replay) read
 * the registry to re-attach to the live class. See
 * `hmr-class-registry.ts` for the runtime side of the contract.
 *
 * The helper exposes two phases used by complementary Vite plugins:
 *   1. `findComponentClassNames(rawTs)` — scans the user's raw TS
 *      source for `@Component`-decorated classes. Used by an
 *      `enforce: 'pre'` plugin to discover names BEFORE the Analog
 *      Angular plugin compiles the file. The discovery has to happen
 *      on raw TS because the Angular plugin rewrites the `@Component`
 *      decorator into static metadata calls (`ɵsetClassMetadata`,
 *      `ɵɵdefineComponent`) and removes the textual `@Component(...)`
 *      pattern.
 *   2. `appendComponentHmrRegistration(compiledCode, names)` — appends
 *      the registration snippet to the END of compiled JS produced by
 *      the Analog Angular plugin. Used by an `enforce: 'post'` plugin.
 *      Appending here is the only reliable insertion point because:
 *        - Class declarations are evaluated and bound by then.
 *        - Angular's static metadata (`ɵcmp`/`ɵfac`) has finished
 *          attaching, so the registered class identity already
 *          carries the up-to-date component definition.
 *        - The Analog Angular plugin's `transform` discards anything
 *          appended before its compilation step (it returns code
 *          regenerated from its own `outputFiles` cache, not the
 *          input passed in). Verified directly in the plugin chain.
 *        - Source-map line offsets for the original module body are
 *          preserved (we only append).
 *
 * The legacy `injectComponentHmrRegistration(rawTs)` helper is kept
 * for backward compatibility — it appends to raw TS in a single call —
 * but is no longer the path used by the live HMR pipeline (its output
 * is silently dropped by the Angular plugin for `@Component` files).
 *
 * The helpers are dev-only: production builds skip the Vite plugins
 * (`apply: 'serve'`), and the runtime hook short-circuits when
 * `isAngularHmrEnabled()` is false.
 */

const COMPONENT_DECORATOR_RE = /@Component\s*\(/g;

/**
 * Marker comment placed immediately before the appended registration
 * block. Plugins can scan for this string to make their work
 * idempotent across re-transforms (the Vite cache may replay the
 * transform pipeline on cached modules).
 */
export const INJECTION_MARKER = '/* @nativescript/vite ns-hmr-register */';

export interface InjectComponentHmrRegistrationOptions {
	/**
	 * Optional override of the global hook name. Defaults to
	 * `__NS_HMR_REGISTER_COMPONENT__`. Exposed for tests; production
	 * callers should keep the default.
	 */
	hookName?: string;
}

export interface InjectComponentHmrRegistrationResult {
	/** New code, or `null` if no transformation is needed. */
	code: string | null;
	/** Names of `@Component` classes detected in the file. */
	componentNames: string[];
}

/**
 * Build the trailing snippet that registers each component class with
 * the global HMR hook. Pure string construction — exposed so the post-
 * Angular plugin can append it to compiled output without re-scanning
 * for class names (the pre plugin already scanned the raw TS source).
 *
 * Returns an empty string when `componentNames` is empty so callers
 * can concatenate unconditionally.
 */
export function buildComponentHmrRegistrationSuffix(componentNames: string[], options: InjectComponentHmrRegistrationOptions = {}): string {
	if (!componentNames || componentNames.length === 0) {
		return '';
	}
	const hookName = options.hookName ?? '__NS_HMR_REGISTER_COMPONENT__';
	const registrationLines = componentNames.map((name) => buildRegistrationLine(hookName, name));
	// Pad with two newlines so the appended block is visually separated
	// from the original module body in source maps and stack traces.
	return `\n\n${INJECTION_MARKER}\n${registrationLines.join('\n')}\n`;
}

/**
 * Append the registration snippet to a piece of code (typically the
 * compiled output from `@analogjs/vite-plugin-angular`) using a list
 * of component names previously discovered in the raw TS source.
 *
 * Returns `{ code: null, componentNames: [] }` if `componentNames`
 * is empty or if the code already contains the injection marker
 * (idempotent re-transform case).
 */
export function appendComponentHmrRegistration(code: string, componentNames: string[], options: InjectComponentHmrRegistrationOptions = {}): InjectComponentHmrRegistrationResult {
	if (!code) {
		return { code: null, componentNames: [] };
	}
	if (!componentNames || componentNames.length === 0) {
		return { code: null, componentNames: [] };
	}
	if (code.includes(INJECTION_MARKER)) {
		return { code: null, componentNames: [] };
	}
	const suffix = buildComponentHmrRegistrationSuffix(componentNames, options);
	if (!suffix) {
		return { code: null, componentNames: [] };
	}
	return {
		code: code + suffix,
		componentNames: [...componentNames],
	};
}

/**
 * Legacy helper: scan raw TypeScript source for `@Component` classes
 * and append registration calls. Retained for tests and for any
 * caller running outside the post-Angular plugin chain.
 *
 * NOTE: For files compiled by `@analogjs/vite-plugin-angular`, this
 * helper's output is discarded — the Angular plugin replaces the
 * input code with the regenerated compiled output from its internal
 * `outputFiles` cache. Use `findComponentClassNames(rawTs)` +
 * `appendComponentHmrRegistration(compiledCode, names)` from a
 * `enforce: 'post'` plugin to survive that compilation step.
 */
export function injectComponentHmrRegistration(code: string, options: InjectComponentHmrRegistrationOptions = {}): InjectComponentHmrRegistrationResult {
	if (!code) {
		return { code: null, componentNames: [] };
	}
	if (code.includes(INJECTION_MARKER)) {
		// Already injected (re-transform case) — return original to avoid
		// duplicating registration calls.
		return { code: null, componentNames: [] };
	}
	if (!COMPONENT_DECORATOR_RE.test(code)) {
		return { code: null, componentNames: [] };
	}
	// RegExp.prototype.test with `g` flag advances lastIndex; reset for the
	// next walk in `findComponentClassNames`.
	COMPONENT_DECORATOR_RE.lastIndex = 0;

	const componentNames = findComponentClassNames(code);
	if (componentNames.length === 0) {
		return { code: null, componentNames: [] };
	}

	const suffix = buildComponentHmrRegistrationSuffix(componentNames, options);
	return {
		code: code + suffix,
		componentNames,
	};
}

function buildRegistrationLine(hookName: string, className: string): string {
	// Wrap each call in its own try so a failure (e.g. the class binding
	// not in scope at module end because the user re-exported it from
	// somewhere else) doesn't break sibling registrations.
	// The typeof guard prevents a ReferenceError if the global hook isn't
	// installed (production builds, non-Angular contexts, isolated unit
	// tests). The "globalThis" reference is universal across modern JS
	// runtimes including the NativeScript iOS/Android runtimes.
	return `try { if (typeof globalThis !== 'undefined' && typeof globalThis.${hookName} === 'function' && typeof ${className} !== 'undefined') { globalThis.${hookName}(${JSON.stringify(className)}, ${className}, typeof import.meta !== 'undefined' && import.meta && import.meta.url ? import.meta.url : ''); } } catch (e) {}`;
}

/**
 * Walk a TS source string and collect class names declared after a
 * `@Component(...)` decorator. Supports:
 *   - `export class Foo` and bare `class Foo`
 *   - `abstract class Foo` (rare for @Component but allowed)
 *   - Any number of additional decorators stacked between `@Component`
 *     and the class keyword (e.g. `@Component({}) @SomethingElse() ...`)
 *
 * Skips matches that fall inside string literals or comments. Uses a
 * paren-matching scanner instead of regex `[\s\S]*?` so multi-line
 * decorator arguments (templates, styles arrays) don't trip up the
 * scanner.
 */
export function findComponentClassNames(code: string): string[] {
	const names: string[] = [];
	const componentRe = /@Component\s*\(/g;
	let match: RegExpExecArray | null;
	while ((match = componentRe.exec(code)) !== null) {
		const matchStart = match.index;
		if (isInsideStringOrComment(code, matchStart)) {
			continue;
		}

		const openParenIdx = matchStart + match[0].length - 1;
		const closeParenIdx = findMatchingDelimiter(code, openParenIdx, '(', ')');
		if (closeParenIdx === -1) {
			continue;
		}

		const className = findClassNameAfter(code, closeParenIdx + 1);
		if (className && !names.includes(className)) {
			names.push(className);
		}
	}
	return names;
}

/**
 * Starting at `position`, skip whitespace and any further decorators
 * (`@Foo(...)`) and return the next class name encountered, or
 * `null` if no class declaration follows.
 */
function findClassNameAfter(code: string, position: number): string | null {
	let i = position;
	while (i < code.length) {
		while (i < code.length && /\s/.test(code[i])) {
			i++;
		}
		if (i >= code.length) {
			return null;
		}

		if (code[i] === '@') {
			// Another decorator stacked between @Component and class.
			i++;
			// Decorator name (identifier).
			while (i < code.length && /[\w$.]/.test(code[i])) {
				i++;
			}
			while (i < code.length && /\s/.test(code[i])) {
				i++;
			}
			if (code[i] === '(') {
				const decoClose = findMatchingDelimiter(code, i, '(', ')');
				if (decoClose === -1) {
					return null;
				}
				i = decoClose + 1;
			}
			continue;
		}

		const remainder = code.slice(i);
		const classMatch = /^(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(remainder);
		if (classMatch) {
			return classMatch[1];
		}
		return null;
	}
	return null;
}

/**
 * True if `index` falls inside a // line comment, /* block comment, or
 * a string/template literal. Used to filter out false positives from
 * `@Component(` matches inside docs or stringified examples.
 */
function isInsideStringOrComment(code: string, index: number): boolean {
	let i = 0;
	let quote: string | null = null;
	let escape = false;
	let inLineComment = false;
	let inBlockComment = false;

	while (i < index) {
		const char = code[i];
		const next = code[i + 1];

		if (inLineComment) {
			if (char === '\n') {
				inLineComment = false;
			}
			i++;
			continue;
		}
		if (inBlockComment) {
			if (char === '*' && next === '/') {
				inBlockComment = false;
				i += 2;
				continue;
			}
			i++;
			continue;
		}
		if (quote) {
			if (escape) {
				escape = false;
				i++;
				continue;
			}
			if (char === '\\') {
				escape = true;
				i++;
				continue;
			}
			if (char === quote) {
				quote = null;
			}
			i++;
			continue;
		}

		if (char === '/' && next === '/') {
			inLineComment = true;
			i += 2;
			continue;
		}
		if (char === '/' && next === '*') {
			inBlockComment = true;
			i += 2;
			continue;
		}
		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			i++;
			continue;
		}
		i++;
	}

	return inLineComment || inBlockComment || quote !== null;
}

/**
 * Find the index of the matching close delimiter for the opener at
 * `openIndex`. Comment- and string-aware so multi-line decorator
 * arguments (template strings, styles arrays) are scanned correctly.
 */
function findMatchingDelimiter(source: string, openIndex: number, openChar: string, closeChar: string): number {
	if (openIndex < 0 || source[openIndex] !== openChar) {
		return -1;
	}

	let depth = 0;
	let quote: string | null = null;
	let escape = false;
	let inLineComment = false;
	let inBlockComment = false;

	for (let index = openIndex; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];

		if (inLineComment) {
			if (char === '\n') {
				inLineComment = false;
			}
			continue;
		}
		if (inBlockComment) {
			if (char === '*' && next === '/') {
				inBlockComment = false;
				index++;
			}
			continue;
		}
		if (quote) {
			if (escape) {
				escape = false;
				continue;
			}
			if (char === '\\') {
				escape = true;
				continue;
			}
			if (char === quote) {
				quote = null;
			}
			continue;
		}

		if (char === '/' && next === '/') {
			inLineComment = true;
			index++;
			continue;
		}
		if (char === '/' && next === '*') {
			inBlockComment = true;
			index++;
			continue;
		}
		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			continue;
		}

		if (char === openChar) {
			depth++;
		} else if (char === closeChar) {
			depth--;
			if (depth === 0) {
				return index;
			}
		}
	}

	return -1;
}
