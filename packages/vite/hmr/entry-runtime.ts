import { getGlobalScope } from './shared/runtime/global-scope.js';
import { restyleRootAndModals } from './shared/runtime/restyle-roots.js';
import { nsDev } from './shared/runtime/dev-globals.js';
import { setAppCssApplier, type AppCssApplier } from './shared/runtime/app-css-applier.js';

let appCssApplied = false;

// `addTaggedAdditionalCSS` accepts either raw CSS text (string) or a
// pre-parsed rework `css` AST object — `CSSSource.fromDetect` routes
// based on typeof. We type the param as `any` so HMR can pass the AST
// `bundle.mjs` publishes as the dev globals' `appCssAst`, which keeps the
// cold-boot application path identical between HMR and the no-HMR rolldown
// bundle (both use the rework AST).
type TaggedCssAdd = (cssOrAst: any, tag: string) => unknown;
type TaggedCssRemove = (tag: string) => unknown;
type TaggedCssApi = { add?: TaggedCssAdd; remove?: TaggedCssRemove };

// Must match the tag used by the boot virtual `app.css` emitter in
// `helpers/main-entry.ts` so HMR's remove/add pair replaces the
// boot-time selectors instead of stacking on top of them.
export const APP_CSS_TAG = 'app.css';

function resolveTaggedCssApi(coreModule: any): TaggedCssApi {
	const candidates: any[] = [coreModule, coreModule?.default, globalThis];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const add = candidate.addTaggedAdditionalCSS;
		const remove = candidate.removeTaggedAdditionalCSS;
		if (typeof add === 'function' && typeof remove === 'function') {
			return { add: add.bind(candidate), remove: remove.bind(candidate) };
		}
	}
	return {};
}

export function installHttpCoreCssSupport(coreModule: any, verbose?: boolean): AppCssApplier | null {
	try {
		const g = getGlobalScope();
		const core = coreModule?.default ?? coreModule;
		const Application = (core && (typeof core.addCss === 'function' ? core : undefined)) || (core?.Application && typeof core.Application.addCss === 'function' ? core.Application : undefined) || (coreModule?.Application && typeof coreModule.Application.addCss === 'function' ? coreModule.Application : undefined) || g.Application;
		if (!Application?.addCss) {
			return null;
		}

		// Re-trigger styling on every reachable root view. The core bridge's
		// Application realm is not always the realm whose Application.run()
		// committed the root, so also consult the seeded global and the
		// Application singletons the root-placeholder run-wrapper records in
		// the dev globals' `knownApplications`.
		const refreshRootViews = () => {
			const candidates: any[] = [Application, g.Application];
			const known = nsDev().knownApplications;
			if (Array.isArray(known)) candidates.push(...known);
			const seenRoots = new Set<any>();
			for (const candidate of candidates) {
				try {
					restyleRootAndModals(candidate?.getRootView?.(), seenRoots);
				} catch {}
			}
		};

		// Replace selectors via remove + add tagged pair so deleted
		// rules disappear (the additive `Application.addCss` cannot
		// undo previously installed selectors).
		const taggedCss = resolveTaggedCssApi(coreModule);
		const applyCss: AppCssApplier = (cssText: string, refreshRoot = true) => {
			if (typeof cssText !== 'string' || !cssText.length) {
				return;
			}

			let appliedTagged = false;
			if (taggedCss.add && taggedCss.remove) {
				try {
					taggedCss.remove(APP_CSS_TAG);
					taggedCss.add(cssText, APP_CSS_TAG);
					appliedTagged = true;
				} catch (taggedError: any) {
					if (verbose) console.warn('[ns-entry] tagged CSS replace failed, falling back to addCss:', taggedError?.message || taggedError);
				}
			}
			if (!appliedTagged) {
				Application.addCss(cssText);
			}
			if (!refreshRoot) {
				return;
			}
			refreshRootViews();
		};

		setAppCssApplier(applyCss);

		if (!appCssApplied) {
			// Cold boot: prefer the pre-parsed rework AST published by
			// `helpers/main-entry.ts` so the HTTP-core realm follows the
			// SAME application path as the no-HMR rolldown bundle. If the
			// AST isn't present (e.g. older bundle, future entry shape),
			// fall back to the raw text path. Live HMR edits arriving via
			// the dev-server WebSocket continue to use `applyCss(rawText)`
			// — `addTaggedAdditionalCSS` accepts either via
			// `CSSSource.fromDetect`.
			const { appCssAst, appCss: appCssText } = nsDev();
			let cssApplied = false;

			if (appCssAst && typeof appCssAst === 'object' && taggedCss.add && taggedCss.remove) {
				try {
					taggedCss.remove(APP_CSS_TAG);
					taggedCss.add(appCssAst, APP_CSS_TAG);
					cssApplied = true;
					if (verbose) console.info('[ns-entry] app.css applied in HTTP core realm via AST');
				} catch (astError: any) {
					if (verbose) console.warn('[ns-entry] AST CSS apply failed, falling back to raw text:', astError?.message || astError);
				}
			}

			if (!cssApplied && typeof appCssText === 'string' && appCssText.length) {
				applyCss(appCssText);
				cssApplied = true;
				if (verbose) console.info('[ns-entry] app.css applied in HTTP core realm via raw text');
			}

			if (cssApplied) {
				appCssApplied = true;
				// Normally installed before the app mounts, so no refresh is
				// needed. A late install finds views already mounted with
				// stale (empty) styling, so re-style.
				if (nsDev().bootComplete) {
					refreshRootViews();
				}
			}
		}

		return applyCss;
	} catch (error: any) {
		if (verbose) console.warn('[ns-entry] failed to install HTTP core CSS support:', error?.message || error);
		return null;
	}
}
