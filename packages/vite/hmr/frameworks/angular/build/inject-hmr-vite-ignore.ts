/**
 * Re-inject `/* @vite-ignore *\/` into Angular's HMR initializer dynamic
 * imports.
 *
 * # Why this exists
 *
 * Angular's compiler (`@angular/compiler`'s `compileHmrInitializer`) emits
 * each `@Component`-decorated class's HMR loader as:
 *
 * ```js
 * function FooComponent_HmrLoad(t) {
 *   import(\/* @vite-ignore *\/ i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url))
 *     .then((m) => m.default && i0.ɵɵreplaceMetadata(FooComponent, m.default, ...));
 * }
 * ```
 *
 * The `\/* @vite-ignore *\/` annotation tells Vite "do not try to
 * statically analyze this dynamic import" — the URL is computed at
 * runtime by `ɵɵgetReplaceMetadataURL`, which produces something like
 * `http://host/ns/m/<componentDir>/@ng/component?c=<id>&t=<ts>` to be
 * resolved by Analog's `liveReloadPlugin` middleware on the dev server.
 *
 * Somewhere along the post-Angular transform chain — empirically the
 * `compact: false` Babel pass driven by the Angular linker, but
 * potentially other plugins as well — the leading-argument comment is
 * being dropped. By the time the file lands on the device, the
 * compiled emit reads:
 *
 * ```js
 *   import(i0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url))
 * ```
 *
 * Vite's static analyzer logs:
 *
 * > The above dynamic import cannot be analyzed by Vite.
 *
 * and rewrites the call site to route through Vite's runtime resolver,
 * which fails on the iOS runtime because the resolver expects a
 * statically-known module specifier. The HMR loader IIFE runs at every
 * component module evaluation (gated by `ngDevMode`), so the failure
 * fires at boot for the FIRST `@Component` whose module is evaluated —
 * typically a base/utility component like `ConfirmationDialogBaseComponent`
 * — and aborts session startup with:
 *
 * > TypeError at Module.ɵɵgetReplaceMetadataURL
 *
 * Re-inserting the annotation downstream of every other transform makes
 * us tolerant of upstream comment-loss without depending on the linker's
 * comment behaviour. The fix is purely additive: if the comment is still
 * present (Angular versions that emit it differently, or future
 * compilers that wrap the URL in an alternate helper), `appendIfMissing`
 * leaves the import untouched.
 *
 * # Idempotence
 *
 * The helper is safe to call repeatedly on the same source — once the
 * annotation is present, subsequent calls become a no-op match by match.
 * Vite's transform pipeline can replay cached transforms during a
 * single dev session, so idempotence is required, not optional.
 *
 * # Surface area
 *
 * We only touch `import()` calls whose argument expression contains
 * `ɵɵgetReplaceMetadataURL` (matching either the literal Unicode form
 * or the escaped `\u0275\u0275getReplaceMetadataURL`). Every other
 * dynamic import is left alone — an over-broad sweep would suppress
 * Vite warnings on user dynamic imports that genuinely should be
 * statically analyzed.
 */

import { findMatchingDelimiter } from './js-lexer.js';

const ANGULAR_HMR_IDENTIFIER = 'getReplaceMetadataURL';
const VITE_IGNORE_COMMENT = '/* @vite-ignore */';

/**
 * Inject `/* @vite-ignore *\/` into every `import()` whose argument
 * references Angular's `ɵɵgetReplaceMetadataURL`. Returns the original
 * code unchanged when no qualifying imports are found.
 */
export function injectAngularHmrViteIgnore(code: string): string {
	if (!code) return code;
	// Cheap pre-check: bail out before walking the source if neither
	// the unicode nor the escape form of the identifier is anywhere in
	// the file. The vast majority of files aren't components, so this
	// short-circuit is the hot path.
	if (!code.includes(ANGULAR_HMR_IDENTIFIER)) return code;

	let output = '';
	let cursor = 0;
	let changed = false;

	while (cursor < code.length) {
		const importIndex = findNextImportCall(code, cursor);
		if (importIndex === -1) {
			output += code.slice(cursor);
			break;
		}

		const openParenIndex = findOpenParenAfter(code, importIndex + 'import'.length);
		if (openParenIndex === -1) {
			output += code.slice(cursor, importIndex + 'import'.length);
			cursor = importIndex + 'import'.length;
			continue;
		}

		const closeParenIndex = findMatchingDelimiter(code, openParenIndex, '(', ')');
		if (closeParenIndex === -1) {
			output += code.slice(cursor, openParenIndex + 1);
			cursor = openParenIndex + 1;
			continue;
		}

		const argumentBody = code.slice(openParenIndex + 1, closeParenIndex);
		if (!referencesReplaceMetadataUrl(argumentBody)) {
			output += code.slice(cursor, closeParenIndex + 1);
			cursor = closeParenIndex + 1;
			continue;
		}

		if (alreadyAnnotated(argumentBody)) {
			output += code.slice(cursor, closeParenIndex + 1);
			cursor = closeParenIndex + 1;
			continue;
		}

		// Insert the annotation immediately after `import(` so the
		// original argument expression — including any leading
		// whitespace the upstream emitter chose — keeps its byte
		// layout. This preserves source-map line stability for the
		// rest of the file: only column offsets after the injection
		// shift, never line numbers.
		output += code.slice(cursor, openParenIndex + 1);
		output += ` ${VITE_IGNORE_COMMENT} `;
		output += code.slice(openParenIndex + 1, closeParenIndex + 1);
		cursor = closeParenIndex + 1;
		changed = true;
	}

	return changed ? output : code;
}

function findNextImportCall(source: string, startIndex: number): number {
	let i = startIndex;
	while (i < source.length) {
		const next = source.indexOf('import', i);
		if (next === -1) return -1;
		// Reject `import.meta` and `import ` keyword forms; only
		// `import(` (with optional whitespace) is a dynamic import.
		const tail = next + 'import'.length;
		const before = source.charCodeAt(next - 1);
		const isWordCharBefore = isIdentifierPart(before);
		if (!isWordCharBefore) {
			let scan = tail;
			while (scan < source.length && isWhitespace(source.charCodeAt(scan))) scan++;
			if (source.charCodeAt(scan) === 0x28 /* '(' */) {
				return next;
			}
		}
		i = tail;
	}
	return -1;
}

function findOpenParenAfter(source: string, index: number): number {
	let i = index;
	while (i < source.length && isWhitespace(source.charCodeAt(i))) i++;
	if (source.charCodeAt(i) === 0x28 /* '(' */) return i;
	return -1;
}

function alreadyAnnotated(argumentBody: string): boolean {
	// Trim only the leading whitespace + comments — body may have many
	// non-`@vite-ignore` block comments later that we don't want to
	// confuse for an already-applied annotation.
	let i = 0;
	while (i < argumentBody.length) {
		const c = argumentBody.charCodeAt(i);
		if (isWhitespace(c)) {
			i++;
			continue;
		}
		if (c === 0x2f /* '/' */ && argumentBody.charCodeAt(i + 1) === 0x2a /* '*' */) {
			const closeIndex = argumentBody.indexOf('*/', i + 2);
			if (closeIndex === -1) return false;
			const commentBody = argumentBody.slice(i + 2, closeIndex);
			if (commentBody.includes('@vite-ignore')) return true;
			i = closeIndex + 2;
			continue;
		}
		// First non-whitespace, non-block-comment token — there's no
		// annotation in the leading whitespace window.
		return false;
	}
	return false;
}

function referencesReplaceMetadataUrl(argumentBody: string): boolean {
	if (!argumentBody) return false;
	if (argumentBody.includes(ANGULAR_HMR_IDENTIFIER)) return true;
	// `\u0275\u0275getReplaceMetadataURL` — unicode-escaped form some
	// transforms emit. The substring above already covers the suffix
	// regardless of the prefix encoding, so this branch is mostly
	// defensive — keep it explicit so future changes to the identifier
	// (e.g. a `replaceMetadataURL` rename without `ɵɵ`) don't silently
	// stop matching.
	return /\\u0275\\u0275getReplaceMetadataURL/.test(argumentBody);
}

function isWhitespace(code: number): boolean {
	return code === 0x20 || code === 0x09 || code === 0x0a || code === 0x0d || code === 0x0b || code === 0x0c;
}

function isIdentifierPart(code: number): boolean {
	if (Number.isNaN(code)) return false;
	if (code === 0x5f /* '_' */ || code === 0x24 /* '$' */) return true;
	if (code >= 0x30 && code <= 0x39) return true;
	if (code >= 0x41 && code <= 0x5a) return true;
	if (code >= 0x61 && code <= 0x7a) return true;
	return false;
}

// Comment-aware paren matcher lives in ./js-lexer.ts
