import type { Plugin } from 'vite';

// Safety-net TypeScript fallback transform.
//
// Problem: In HMR mode (where `useAngularCompilationAPI = false`), the
// `@analogjs/vite-plugin-angular` `config` hook forcibly sets `oxc: false` on
// the Vite config (see `angular-vite-plugin.js`:
// `const oxc = pluginOptions.useAngularCompilationAPI ? undefined : (config.oxc ?? false);`).
// That disables Vite's built-in oxc TypeScript transformer for the whole dev
// session. The Analog plugin then expects its own `fileEmitter` to strip types
// from every `.ts` file in the project — but `fileEmitter` only knows about
// files that are part of the Angular TypeScript program (anything imported
// directly, or referenced via `templateUrl` / `styleUrls` from a decorated
// class).
//
// Worker entry files fall outside the program. They are only loaded via
// `new Worker(new URL('./foo.worker', import.meta.url))`, which is NOT an
// import — it's a URL constructor expression the device resolves at runtime.
// `fileEmitter(id)` returns nothing for those files, the Analog plugin's
// transform returns `undefined`, oxc doesn't run (because Analog disabled it),
// and the raw `.ts` source reaches the device with type annotations intact.
// V8's parser then chokes on the first `(x: Type)` parameter annotation with
// `SyntaxError: Unexpected token ':'`.
//
// The fix is a small post-enforce transform that re-runs Vite's own
// `transformWithOxc` on any `.ts`/`.tsx` file that still looks like raw
// TypeScript after the rest of the pipeline is done. For already-compiled
// Angular output (pure JS), the detection heuristic short-circuits and we
// never invoke oxc, so the fast path stays fast.
//
// Scope intentionally narrow:
//  * `enforce: 'post'` — only sees final code after every other plugin had a
//    chance to transform.
//  * `apply: 'serve'` — dev/HMR only. Production builds use Rolldown which
//    handles TS natively without needing this net.
//  * Skips `node_modules` / `.vite` — third-party code has its own pipeline,
//    and hitting every transitive dep would be wasteful.
//  * Skips files containing Angular decorators (`@Component`, `@Injectable`,
//    `@NgModule`, `@Directive`, `@Pipe`). Those files belong to the Angular
//    program; if they fell through the Angular plugin we surface Angular's
//    own `"contains Angular decorators but is not in the TypeScript program"`
//    warning rather than silently transforming them with oxc (which would
//    emit a `@oxc-project/runtime/helpers/decorate` import that the app does
//    not depend on, breaking Vite's import-analysis pass).
//  * Regex-based detection — catches the tokens V8 would actually reject.
//    False positives (running oxc on valid JS) are harmless because oxc with
//    `lang: 'ts'` is a no-op on JS; false negatives would only surface as the
//    same error the fix is designed to prevent, so the detector errs toward
//    running the transform when in doubt.

const TS_ONLY_SYNTAX_RE = new RegExp(
	[
		// `import type { … } from '…'` / `export type { … } from '…'`
		String.raw`\b(?:import|export)\s+type\s`,
		// `interface Foo { … }`
		String.raw`\binterface\s+[A-Z_$][\w$]*\s*[<{]`,
		// `type Foo = …`
		String.raw`\btype\s+[A-Z_$][\w$]*\s*[<=]`,
		// `as Type` assertions — restrict right-hand side to common primitives
		// or PascalCase identifiers to avoid catching unrelated tokens.
		String.raw`\bas\s+(?:string|number|boolean|any|unknown|never|void|[A-Z][\w$]*)\b`,
		// Parameter / destructured type annotations: `(msg: any)`, `(x: T, y: U)`.
		// Anchored to `(` or `,` so we don't match object literal keys like `{ a: 1 }`.
		String.raw`[(,]\s*[\w$]+\s*\??\s*:\s*(?:string|number|boolean|any|unknown|never|void|null|undefined|object|[A-Z][\w$]*(?:<[^>]*>)?(?:\[\])?)\b`,
		// Variable type annotations: `let x: T = …` / `const y: T`
		String.raw`\b(?:const|let|var)\s+[\w$]+\s*:\s*[\w$<>[\]|&., ]+\s*[;=]`,
		// Return type annotations on arrow functions: `): T =>`
		String.raw`\)\s*:\s*(?:string|number|boolean|any|unknown|never|void|[A-Z][\w$]*(?:<[^>]*>)?)\s*(?:=>|\{)`,
	].join('|'),
);

// Decorator shapes that mean "the Angular plugin owns this file, stay out of
// its way." We do NOT try to compile these ourselves even if the Angular
// plugin's `fileEmitter` didn't produce output for them — oxc would rewrite
// the decorators into `import _decorate from "@oxc-project/runtime/helpers/decorate"`
// calls, Vite's import-analysis would fail to resolve that helper package,
// and we'd turn a harmless "not in TypeScript program" warning into a fatal
// import error. Better to let Angular's own warning surface and leave the
// code untouched.
const ANGULAR_DECORATOR_RE = /@(?:Component|Directive|Injectable|NgModule|Pipe)\s*\(/;

const TS_FALLBACK_SKIP_ID_RE = /(?:^|\/)(?:node_modules|\.vite)\//;

export interface TsFallbackTransformPluginOptions {
	verbose?: boolean;
}

export function tsFallbackTransformPlugin(opts?: TsFallbackTransformPluginOptions): Plugin {
	const { verbose } = opts || {};
	// Cached after the first successful import so repeated transforms don't
	// pay the dynamic-import cost. `null` = not loaded yet; `false` = load
	// attempted and failed (older Vite with no oxc export — we'll skip).
	let cachedTransformWithOxc: ((code: string, id: string, options?: any) => Promise<{ code: string; map: any }>) | null | false = null;

	return {
		name: 'nativescript-ts-fallback-transform',
		enforce: 'post',
		apply: 'serve',

		async transform(code, id) {
			if (cachedTransformWithOxc === false) return null;
			const cleanId = id.split('?', 1)[0];
			if (!cleanId || !/\.(m?ts|[jt]sx)$/.test(cleanId)) return null;
			if (TS_FALLBACK_SKIP_ID_RE.test(cleanId)) return null;
			if (ANGULAR_DECORATOR_RE.test(code)) return null;
			if (!TS_ONLY_SYNTAX_RE.test(code)) return null;

			if (cachedTransformWithOxc === null) {
				try {
					// Dynamic import keeps this plugin cross-version-safe: older
					// Vite installs without `transformWithOxc` (pre-Rolldown
					// builds) cleanly disable this fallback instead of crashing.
					const vite: any = await import('vite');
					if (typeof vite.transformWithOxc === 'function') {
						cachedTransformWithOxc = vite.transformWithOxc;
					} else {
						cachedTransformWithOxc = false;
						return null;
					}
				} catch {
					cachedTransformWithOxc = false;
					return null;
				}
			}

			try {
				const lang = cleanId.endsWith('tsx') ? 'tsx' : cleanId.endsWith('jsx') ? 'jsx' : 'ts';
				const result = await (cachedTransformWithOxc as any)(code, cleanId, { lang });
				if (!result || typeof result.code !== 'string') return null;
				if (verbose) {
					// eslint-disable-next-line no-console
					console.log(`[ns-ts-fallback] type-stripped ${cleanId}`);
				}
				return { code: result.code, map: result.map ?? null };
			} catch (err) {
				if (verbose) {
					// eslint-disable-next-line no-console
					console.warn(`[ns-ts-fallback] transformWithOxc failed for ${cleanId}:`, err);
				}
				return null;
			}
		},
	};
}
