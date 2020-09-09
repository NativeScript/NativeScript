import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Builder } from '@nativescript/core/ui/builder';
import * as view from '@nativescript/core/ui/core/view';
import * as platform from '@nativescript/core/platform';
import { WebView } from '@nativescript/core/ui/web-view';
import { UITest } from '../../ui-test';
import { left, top, right, bottom, equal } from '../layouts/layout-tests-helper';

export class WebViewSafeAreaTest extends UITest<WebView> {
	private executeSnippet<U extends { root: view.View }>(ui: U, setup: (ui: U) => void, test: (ui: U) => void, pageOptions?: helper.PageOptions): void {
		function waitUntilTestElementLayoutIsValid(view: view.View, timeoutSec?: number): void {
			TKUnit.waitUntilReady(() => {
				return view.isLayoutValid;
			}, timeoutSec || 1);
		}

		setup(ui);
		helper.buildUIAndRunTest(
			ui.root,
			() => {
				waitUntilTestElementLayoutIsValid(ui.root);
				test(ui);
			},
			pageOptions
		);
	}

	private noop() {
		// no operation
	}

	private getViews(template: string) {
		let root = Builder.parse(template);

		return {
			root,
			list: root.getViewById('webview') as WebView,
		};
	}

	private webview_in_full_screen(webView: WebView, pageOptions?: helper.PageOptions) {
		const l = left(webView);
		const t = top(webView);
		const r = right(webView);
		const b = bottom(webView);
		equal(l, 0, `${webView}.left - actual:${l}; expected: ${0}`);
		equal(t, 0, `${webView}.top - actual:${t}; expected: ${0}`);
		equal(r, platform.Screen.mainScreen.widthPixels, `${webView}.right - actual:${r}; expected: ${platform.Screen.mainScreen.widthPixels}`);
		equal(b, platform.Screen.mainScreen.heightPixels, `${webView}.bottom - actual:${b}; expected: ${platform.Screen.mainScreen.heightPixels}`);
	}

	private webview_in_full_screen_test(pageOptions?: helper.PageOptions) {
		const snippet = `
        <WebView id="webview" loaded="onLoaded" backgroundColor="Crimson"></WebView>
        `;
		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ list }) => {
				this.webview_in_full_screen(list, pageOptions);
			},
			pageOptions
		);
	}

	public test_webview_in_full_screen_action_bar() {
		this.webview_in_full_screen_test({ actionBar: true });
	}

	public test_webview_in_full_screen_action_bar_hidden() {
		this.webview_in_full_screen_test({ actionBarHidden: true });
	}

	public test_webview_in_full_screen_action_bar_flat() {
		this.webview_in_full_screen_test({ actionBarFlat: true });
	}

	public test_webview_in_full_screen_tab_bar() {
		this.webview_in_full_screen_test({ tabBar: true });
	}
}

export function createTestCase(): WebViewSafeAreaTest {
	return new WebViewSafeAreaTest();
}
