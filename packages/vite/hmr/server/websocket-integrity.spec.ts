import { describe, it, expect } from 'vitest';
import { parse as babelParse } from '@babel/parser';
import { buildBootProgressSnippet } from './websocket-served-module-helpers.js';
import { ensureNativeScriptModuleBindings } from './websocket-module-bindings.js';

function parseOk(code: string): { ok: boolean; error?: any } {
	try {
		babelParse(code, { sourceType: 'module', plugins: ['jsx', 'importMeta', 'topLevelAwait', 'logicalAssignment', 'optionalChaining', 'nullishCoalescingOperator', 'optionalCatchBinding'] as any });
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e };
	}
}

describe('vendor-binding syntax integrity', () => {
	it('produces valid JS for multiple plugin import shapes (app-like)', () => {
		const input = `
import App from '@/components/App.vue';
import { createPinia } from 'pinia';
import LottieView from '@nativescript-community/ui-lottie';
import { WebViewPlugin } from '@nativescript-community/ui-webview';
import { SVGView } from '@nativescript-community/ui-svg';
import { RiveView } from '@nativescript/rive';
import { registerUniversalLinkCallback } from '@nativescript-community/universal-links';
import { firebase } from '@nativescript/firebase-core';
import { initialize as initializeImage, Img } from '@nativescript-community/ui-image';
import { CreditCardView } from '@triniwiz/nativescript-stripe';
import { PullToRefresh } from '@nativescript-community/ui-pulltorefresh';
import { Carousel, CarouselItem } from '@nstudio/nativescript-carousel';
import { AnimatedCircle } from '@nativescript/animated-circle';
import dayjs from 'dayjs';
import GoogleMaps from '@nativescript/google-maps';
import { install } from '@nativescript-community/gesturehandler';

export function boot() {
  return [App, createPinia, LottieView, WebViewPlugin, SVGView, RiveView, registerUniversalLinkCallback, firebase, initializeImage, Img, CreditCardView, PullToRefresh, Carousel, CarouselItem, AnimatedCircle, dayjs, GoogleMaps, install];
}
`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).not.toMatch(/import\s+.*from\s+['\"](?:pinia|@nativescript|dayjs)/);
		const res = parseOk(out);
		if (!res.ok) {
			// For easier diagnostics in failures
			// eslint-disable-next-line no-console
			const err: any = res.error as any;
			const pos: number = err?.pos ?? err?.loc?.index ?? -1;
			const start = Math.max(0, pos - 80);
			const end = Math.min(out.length, pos + 80);
			const around = out.slice(start, end);
			// eslint-disable-next-line no-console
			console.error('Parse failed:', err?.message, 'at', err?.loc, '\n--- around ---\n', around, '\n--- code ---\n', out);
		}
		expect(res.ok).toBe(true);
	});

	it('keeps named-only plugin import syntax-valid after removal', () => {
		const input = `import { install } from '@nativescript-community/gesturehandler'; export const x = install;`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(parseOk(out).ok).toBe(true);
	});

	it('produces valid JS for the boot progress snippet', () => {
		const out = `${buildBootProgressSnippet('/src/main.ts')}export const ready = true;`;
		expect(parseOk(out).ok).toBe(true);
	});

	// Round-5 (2026-05-10) regression guard: the snippet must contain NO
	// top-level `await`. This is the canonical reproduction:
	//
	//   1. Entry tagging in `vite-plugin.ts` wraps `mainEntryPathname`
	//      with `__ns_boot__/b1/` so the dev-server detects main.ts as
	//      a boot request and injects the snippet at the top of the
	//      served module body.
	//   2. The then-current boot-tag rewriter (since removed; inbound
	//      `__ns_boot__/` prefixes are now stripped by
	//      `canonicalizeNsMImportPath`) preserved the boot prefix on
	//      EVERY app-module static import that flowed through the
	//      boot-tagged module, so the snippet propagated through the
	//      entire transitive app-module graph (~7 modules for the
	//      safety app, hundreds for larger Angular apps).
	//   3. Any module containing a top-level `await` keyword — even one
	//      guarded by `if (...) { await ...; }` — is parsed as an ASYNC
	//      module by V8. `module->Evaluate()` returns a Promise.
	//   4. iOS pumps that promise inside `pumpAsyncProgress`
	//      (`ModuleInternal.mm`) against the
	//      `const NSTimeInterval timeoutSeconds = isHttpModule ? 10.0 : 1.0;`
	//      per-module deadline. The 10s applies to main.ts's ENTIRE
	//      promise resolution, which can't settle until every transitive
	//      app-module body has resolved.
	//   5. The async-module protocol overhead + the sequential
	//      `+sendSynchronousRequest:` fetches in `HMRSupport.mm`'s
	//      synchronous HTTP loader reliably push main.ts's promise past
	//      10s and the boot dies with `Top-level await timed out for
	//      HTTP ES module: http://127.0.0.1:5173/ns/m/src/main.ts`
	//      plus a downstream `Missing environment URL: dynamicAPI`
	//      cascade as the failed bootstrap leaves `process.env` empty.
	//
	// Verified end-to-end against the safety app on 2026-05-10: a
	// round-4 snippet with a wall-clock-throttled yield (`first 2
	// modules + every 600ms`) reproduced the timeout even though the
	// actual `await` only fires twice. Removing the `await` keyword
	// entirely is the only shape that lets V8 evaluate every boot-tagged
	// module synchronously — main.ts then does NOT return a Promise from
	// `Evaluate()` and the iOS top-level-await deadline is never armed.
	//
	// What we lose: the snippet can no longer drive run-loop pumping
	// during boot. The heartbeat in `startBootImportHeartbeat`
	// (`session-bootstrap.ts`) still ticks via `setInterval` on the JS
	// thread, which during cold boot is a dedicated background thread
	// (per `HMRSupport.mm`'s "the JS thread becomes the iOS main thread
	// post-Angular-bootstrap" comment). That lets the heartbeat call
	// `setHmrBootStage` and the iOS main thread handle the UIKit
	// view-property writes in parallel with the boot fetches. If a
	// future iOS-runtime change moves boot onto the iOS main thread the
	// bar will visibly freeze again — but boot will still COMPLETE,
	// which is the non-negotiable requirement this guard enforces.
	it('contains NO top-level await (round-5 sync-snippet contract)', () => {
		const snippet = buildBootProgressSnippet('/src/main.ts');
		// Hard ban on any `await` — even hidden inside a method call,
		// inside an `if`, or wrapped around `new Promise`. If anyone adds
		// a top-level await back into the snippet, the boot will time out.
		expect(snippet).not.toMatch(/\bawait\b/);
		// Belt-and-braces: also forbid the historical idiom that drove the
		// timeout regression (in case someone reintroduces `await` via a
		// different syntactic path).
		expect(snippet).not.toMatch(/await\s+new\s+Promise/);
		expect(snippet).not.toMatch(/__NS_HMR_BOOT_LAST_YIELD_AT__/);
	});

	// Round-4 (2026-05-10) regression guard, retained: the snippet must
	// NOT call `setBootStage` itself. An earlier shape called
	// `__nsBootApi.setBootStage('importing-main', { detail, progress })`
	// inline for the first 8 modules + every 90ms thereafter. Each call
	// resolved through `applySnapshotToBootRefs` in `dev-overlay.ts`,
	// which writes 9 properties on NativeScript views; each is a
	// JS-to-Objective-C bridge call into UIKit on the main thread, ~10ms
	// each. Across a real Angular boot that throttle produced ~119 calls
	// → ~1.8s of pure UIKit overhead in the snippet body, which compounds
	// the sync-fetch budget. Removing `setBootStage` from the snippet and
	// relying on the 250ms heartbeat in `session-bootstrap.ts` keeps the
	// per-module overhead at "two property writes" (microseconds).
	it('does not call setBootStage from the snippet (round-4 cheap-write contract)', () => {
		const snippet = buildBootProgressSnippet('/src/main.ts');
		expect(snippet).not.toMatch(/setBootStage/);
		expect(snippet).not.toMatch(/__NS_HMR_DEV_OVERLAY__/);
		expect(snippet).not.toMatch(/__nsBootApi/);
		// And the snippet must not assemble the heartbeat's detail string
		// inline — `Evaluated N modules` is owned by `formatBootImportDetail`
		// in `boot-progress.ts`, called by the heartbeat.
		expect(snippet).not.toMatch(/Evaluated /);
		// But it MUST still bump the two globals the heartbeat reads.
		// Without these the heartbeat would have nothing to report and the
		// bar would freeze at 30 (the `'importing-main'` base).
		expect(snippet).toMatch(/__NS_HMR_BOOT_MODULE_COUNT__/);
		expect(snippet).toMatch(/__NS_HMR_BOOT_LAST_MODULE__/);
	});
});
