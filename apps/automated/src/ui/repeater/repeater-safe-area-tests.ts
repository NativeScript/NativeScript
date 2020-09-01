import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Builder } from '@nativescript/core/ui/builder';
import * as view from '@nativescript/core/ui/core/view';
import * as platform from '@nativescript/core/platform';
import { Repeater } from '@nativescript/core/ui/repeater';
import { UITest } from '../../ui-test';
import { left, top, right, bottom, equal } from '../layouts/layout-tests-helper';

export class RepeaterSafeAreaTest extends UITest<Repeater> {
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
			list: root.getViewById('repeater') as Repeater,
		};
	}

	private repeater_in_full_screen(repeater: Repeater, pageOptions?: helper.PageOptions) {
		const l = left(repeater);
		const t = top(repeater);
		const r = right(repeater);
		const b = bottom(repeater);
		equal(l, 0, `${repeater}.left - actual:${l}; expected: ${0}`);
		equal(t, 0, `${repeater}.top - actual:${t}; expected: ${0}`);
		equal(r, platform.Screen.mainScreen.widthPixels, `${repeater}.right - actual:${r}; expected: ${platform.Screen.mainScreen.widthPixels}`);
		equal(b, platform.Screen.mainScreen.heightPixels, `${repeater}.bottom - actual:${b}; expected: ${platform.Screen.mainScreen.heightPixels}`);
	}

	private repeater_in_full_screen_test(pageOptions?: helper.PageOptions) {
		const snippet = `
        <Repeater id="repeater" loaded="onLoaded" backgroundColor="Crimson"></Repeater>
        `;
		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ list }) => {
				this.repeater_in_full_screen(list, pageOptions);
			},
			pageOptions
		);
	}

	public test_repeater_in_full_screen_action_bar() {
		this.repeater_in_full_screen_test({ actionBar: true });
	}

	public test_repeater_in_full_screen_action_bar_hidden() {
		this.repeater_in_full_screen_test({ actionBarHidden: true });
	}

	public test_repeater_in_full_screen_action_bar_flat() {
		this.repeater_in_full_screen_test({ actionBarFlat: true });
	}

	public test_repeater_in_full_screen_tab_bar() {
		this.repeater_in_full_screen_test({ tabBar: true });
	}
}

export function createTestCase(): RepeaterSafeAreaTest {
	return new RepeaterSafeAreaTest();
}
