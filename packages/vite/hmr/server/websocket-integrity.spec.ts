import { describe, it, expect } from 'vitest';
import { parse as babelParse } from '@babel/parser';
import { ensureNativeScriptModuleBindings } from './websocket.js';

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
});
