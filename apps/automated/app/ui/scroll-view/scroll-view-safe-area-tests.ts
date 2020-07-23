import { UITest } from '../../ui-test';
import { ScrollView } from '@nativescript/core/ui/scroll-view';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import * as TKUnit from '../../tk-unit';
import * as view from '@nativescript/core/ui/core/view';
import * as platform from '@nativescript/core/platform';

import * as helper from '../../ui-helper';
import { Builder } from '@nativescript/core/ui/builder';
import { dipToDp, left, top, right, bottom, height, width, equal, lessOrCloseEnough, greaterOrCloseEnough, isLeftAlignedWith, isRightAlignedWith, isTopAlignedWith, isBottomAlignedWith, isLeftWith, isRightWith, isBelowWith } from '../layouts/layout-tests-helper';

class ScrollLayoutSafeAreaTest extends UITest<ScrollView> {
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
			grid: root.getViewById('grid') as GridLayout,
			stack: root.getViewById('stack') as GridLayout,
			childFirst: root.getViewById('childFirst') as view.View,
			cells: [
				[root.getViewById('cell00') as view.View, root.getViewById('cell01') as view.View, root.getViewById('cell02') as view.View],
				[root.getViewById('cell10') as view.View, root.getViewById('cell11') as view.View, root.getViewById('cell12') as view.View],
				[root.getViewById('cell20') as view.View, root.getViewById('cell21') as view.View, root.getViewById('cell22') as view.View],
			],
		};
	}

	private scroll_view_in_full_screen(scrollView: view.View, pageOptions?: helper.PageOptions) {
		const l = left(scrollView);
		const t = top(scrollView);
		const r = right(scrollView);
		const b = bottom(scrollView);
		equal(l, 0, `${scrollView}.left - actual:${l}; expected: ${0}`);
		equal(t, 0, `${scrollView}.top - actual:${t}; expected: ${0}`);
		equal(r, platform.Screen.mainScreen.widthPixels, `${scrollView}.right - actual:${r}; expected: ${platform.Screen.mainScreen.widthPixels}`);
		equal(b, platform.Screen.mainScreen.heightPixels, `${scrollView}.bottom - actual:${b}; expected: ${platform.Screen.mainScreen.heightPixels}`);
	}

	private scroll_view_in_full_screen_test(pageOptions?: helper.PageOptions) {
		const snippet = `
        <ScrollView id="scroll" backgroundColor="Crimson"></ScrollView>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.scroll_view_in_full_screen(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_scroll_view_in_full_screen_action_bar() {
		this.scroll_view_in_full_screen_test({ actionBar: true });
	}

	public test_scroll_view_in_full_screen_action_bar_hidden() {
		this.scroll_view_in_full_screen_test({ actionBarHidden: true });
	}

	public test_scroll_view_in_full_screen_action_bar_flat() {
		this.scroll_view_in_full_screen_test({ actionBarFlat: true });
	}

	public test_scroll_view_in_full_screen_tab_bar() {
		this.scroll_view_in_full_screen_test({ tabBar: true });
	}

	private scroll_view_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <ScrollView id="scroll" backgroundColor="Crimson">
            <StackLayout id="stack">
                <Label id="childFirst" text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
        </ScrollView>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, stack, childFirst }) => {
				const insets = root.getSafeAreaInsets();

				isLeftAlignedWith(root, stack);
				isTopAlignedWith(root, stack);
				isRightAlignedWith(root, stack);

				isLeftWith(root, childFirst, insets.left);
				isBelowWith(root, childFirst, insets.top);
				isRightWith(childFirst, root, insets.right);

				const scrollViewContentHeight = round(dipToDp(root.nativeViewProtected.contentSize.height));
				const sumOfNestedLabelHeightsAndInsets = height(childFirst) * stack.getChildrenCount() + insets.top + insets.bottom;
				equal(scrollViewContentHeight, sumOfNestedLabelHeightsAndInsets, `scroll view content height<${scrollViewContentHeight}> sum of nested label height and insets <${sumOfNestedLabelHeightsAndInsets}>`);
			},
			pageOptions
		);
	}

	public test_scroll_view_children_components_in_safe_area() {
		this.scroll_view_children_components_in_safe_area({ actionBar: true });
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_action_bar_hidden() {
		this.scroll_view_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_action_bar_flat() {
		this.scroll_view_children_components_in_safe_area({ actionBarFlat: true });
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_tab_bar() {
		this.scroll_view_children_components_in_safe_area({ tabBar: true });
	}

	private grid_nested_scroll_views_layout_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <ScrollView id="cell00" row="0" col="0" backgroundColor="SkyBlue">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell01" row="0" col="1" backgroundColor="Indigo">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell02" row="0" col="2" backgroundColor="Crimson">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell10" row="1" col="0" backgroundColor="Chocolate">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell11" row="1" col="1" backgroundColor="Cornsilk">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell12" row="1" col="2" backgroundColor="BurlyWood">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell20" row="2" col="0" backgroundColor="GoldenRod">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell21" row="2" col="1" backgroundColor="Khaki">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
            <ScrollView id="cell22" row="2" col="2" backgroundColor="IndianRed">
                <StackLayout>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                    <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                </StackLayout>
            </ScrollView>
        </GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, grid, cells }) => {
				isLeftAlignedWith(grid, cells[0][0]);
				isLeftAlignedWith(grid, cells[1][0]);
				isLeftAlignedWith(grid, cells[2][0]);

				isTopAlignedWith(grid, cells[0][0]);
				isTopAlignedWith(grid, cells[0][1]);
				isTopAlignedWith(grid, cells[0][2]);

				isRightAlignedWith(grid, cells[0][2]);
				isRightAlignedWith(grid, cells[1][2]);
				isRightAlignedWith(grid, cells[2][2]);

				isBottomAlignedWith(grid, cells[2][0]);
				isBottomAlignedWith(grid, cells[2][1]);
				isBottomAlignedWith(grid, cells[2][2]);

				greaterOrCloseEnough(height(cells[0][1]), height(cells[1][1]), `cell01 height<${height(cells[0][1])}> not greater or close enough cell11 height<${height(cells[1][1])}>`);
				lessOrCloseEnough(height(cells[1][1]), height(cells[2][1]), `cell11 height<${height(cells[1][1])}> not less or close enough cell21 height<${height(cells[2][1])}>`);

				const sumOfNestedScrollViewHeights = height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]);
				equal(height(grid), sumOfNestedScrollViewHeights, `grid height<${height(grid)}> sum of nested scroll views height <${sumOfNestedScrollViewHeights}>`);

				greaterOrCloseEnough(width(cells[1][0]), width(cells[1][1]), `cell10 width<${width(cells[1][0])}> not greater or close enough cell11 width<${width(cells[1][1])}>`);
				lessOrCloseEnough(width(cells[1][1]), width(cells[1][2]), `cell11 width<${width(cells[1][1])}> not less or close enough cell12 width<${width(cells[1][2])}>`);
				const sumOfNestedScrollViewWidths = width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2]);
				equal(width(grid), sumOfNestedScrollViewWidths, `grid width<${width(grid)}> sum of nested scroll views width <${sumOfNestedScrollViewWidths}>`);
			},
			pageOptions
		);
	}

	public test_grid_nested_scroll_views_layout_beyond_safe_area_action_bar() {
		this.grid_nested_scroll_views_layout_beyond_safe_area({ actionBar: true });
	}

	public test_grid_component_cells_layout_in_safe_area_action_bar_hidden() {
		this.grid_nested_scroll_views_layout_beyond_safe_area({ actionBarHidden: true });
	}

	public test_grid_component_cells_layout_in_safe_area_action_bar_flat() {
		this.grid_nested_scroll_views_layout_beyond_safe_area({ actionBarFlat: true });
	}

	public test_grid_component_cells_layout_in_safe_area_tab_bar() {
		this.grid_nested_scroll_views_layout_beyond_safe_area({ tabBar: true });
	}
}

export function createTestCase(): ScrollLayoutSafeAreaTest {
	return new ScrollLayoutSafeAreaTest();
}
