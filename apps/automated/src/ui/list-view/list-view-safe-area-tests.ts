import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Builder } from '@nativescript/core/ui/builder';
import * as view from '@nativescript/core/ui/core/view';
import * as platform from '@nativescript/core/platform';
import { ListView } from '@nativescript/core/ui/list-view';
import { ViewModel } from './list-view-view-model';
import { UITest } from '../../ui-test';
import { left, top, right, bottom, height, width, equal, lessOrCloseEnough, greaterOrCloseEnough, isLeftAlignedWith, isRightAlignedWith, isTopAlignedWith } from '../layouts/layout-tests-helper';

export class ListViewSafeAreaTest extends UITest<ListView> {
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
			list: root.getViewById('list') as ListView,
			cells: [
				[root.getViewById('cell00') as ListView, root.getViewById('cell01') as ListView, root.getViewById('cell02') as ListView],
				[root.getViewById('cell10') as ListView, root.getViewById('cell11') as ListView, root.getViewById('cell12') as ListView],
				[root.getViewById('cell20') as ListView, root.getViewById('cell21') as ListView, root.getViewById('cell22') as ListView],
			],
		};
	}

	private list_view_in_full_screen(listView: ListView, pageOptions?: helper.PageOptions) {
		const l = left(listView);
		const t = top(listView);
		const r = right(listView);
		const b = bottom(listView);
		equal(l, 0, `${listView}.left - actual:${l}; expected: ${0}`);
		equal(t, 0, `${listView}.top - actual:${t}; expected: ${0}`);
		equal(r, platform.Screen.mainScreen.widthPixels, `${listView}.right - actual:${r}; expected: ${platform.Screen.mainScreen.widthPixels}`);
		equal(b, platform.Screen.mainScreen.heightPixels, `${listView}.bottom - actual:${b}; expected: ${platform.Screen.mainScreen.heightPixels}`);
	}

	private list_view_in_full_screen_test(pageOptions?: helper.PageOptions) {
		const snippet = `
        <ListView id="list" loaded="onLoaded" backgroundColor="Crimson"></ListView>
        `;
		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ list }) => {
				this.list_view_in_full_screen(list, pageOptions);
			},
			pageOptions
		);
	}

	public test_list_view_in_full_screen_action_bar() {
		this.list_view_in_full_screen_test({ actionBar: true });
	}

	public test_list_view_in_full_screen_action_bar_hidden() {
		this.list_view_in_full_screen_test({ actionBarHidden: true });
	}

	public test_list_view_in_full_screen_action_bar_flat() {
		this.list_view_in_full_screen_test({ actionBarFlat: true });
	}

	public test_list_view_in_full_screen_tab_bar() {
		this.list_view_in_full_screen_test({ tabBar: true });
	}

	private grid_nested_list_views_layout_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <ListView id="cell00" row="0" col="0" items="{{ items }}" loaded="onLoaded"  backgroundColor="SkyBlue">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell01" row="0" col="1" items="{{ items }}" loaded="onLoaded" backgroundColor="Indigo">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell02" row="0" col="2" items="{{ items }}" loaded="onLoaded" backgroundColor="Crimson">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell10" row="1" col="0" items="{{ items }}" loaded="onLoaded" backgroundColor="Chocolate">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell11" row="1" col="1" items="{{ items }}" loaded="onLoaded" backgroundColor="Cornsilk">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell12" row="1" col="2" items="{{ items }}" loaded="onLoaded" backgroundColor="BurlyWood">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell20" row="2" col="0" items="{{ items }}" loaded="onLoaded" backgroundColor="GoldenRod">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell21" row="2" col="1" items="{{ items }}" loaded="onLoaded" backgroundColor="Khaki">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>

            <ListView id="cell22" row="2" col="2" items="{{ items }}" loaded="onLoaded" backgroundColor="IndianRed">
                <ListView.itemTemplate>
                    <Label text="{{ text }}"></Label>
                </ListView.itemTemplate>
            </ListView>
        </GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			({ cells }) => {
				cells[0][0].on('loaded', setBindingContext(cells[0][0]));
				cells[0][1].on('loaded', setBindingContext(cells[0][1]));
				cells[0][2].on('loaded', setBindingContext(cells[0][2]));

				cells[1][0].on('loaded', setBindingContext(cells[1][0]));
				cells[1][1].on('loaded', setBindingContext(cells[1][1]));
				cells[1][2].on('loaded', setBindingContext(cells[1][2]));

				cells[2][0].on('loaded', setBindingContext(cells[2][0]));
				cells[2][1].on('loaded', setBindingContext(cells[2][1]));
				cells[2][2].on('loaded', setBindingContext(cells[2][2]));
			},
			({ root, cells }) => {
				isLeftAlignedWith(root, cells[0][0]);
				isLeftAlignedWith(root, cells[1][0]);
				isLeftAlignedWith(root, cells[2][0]);

				isTopAlignedWith(root, cells[0][0]);
				isTopAlignedWith(root, cells[0][1]);
				isTopAlignedWith(root, cells[0][2]);

				isRightAlignedWith(root, cells[0][2]);
				isRightAlignedWith(root, cells[1][2]);
				isRightAlignedWith(root, cells[2][2]);

				greaterOrCloseEnough(height(cells[0][1]), height(cells[1][1]), `cell01 height<${height(cells[0][1])}> not greater or close enough cell11 height<${height(cells[1][1])}>`);
				lessOrCloseEnough(height(cells[1][1]), height(cells[2][1]), `cell11 height<${height(cells[1][1])}> not less or close enough cell21 height<${height(cells[2][1])}>`);

				const sumOfNestedListViewHeights = height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]);
				equal(height(root), sumOfNestedListViewHeights, `grid height<${height(root)}> sum of nested list views height <${sumOfNestedListViewHeights}>`);

				greaterOrCloseEnough(width(cells[1][0]), width(cells[1][1]), `cell10 width<${width(cells[1][0])}> not greater or close enough cell11 width<${width(cells[1][1])}>`);
				lessOrCloseEnough(width(cells[1][1]), width(cells[1][2]), `cell11 width<${width(cells[1][1])}> not less or close enough cell12 width<${width(cells[1][2])}>`);

				const sumOfNestedListViewWidths = width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2]);
				equal(width(root), sumOfNestedListViewWidths, `grid width<${width(root)}> sum of nested list views width <${sumOfNestedListViewWidths}>`);
			},
			pageOptions
		);
	}

	public test_grid_nested_list_views_layout_beyond_safe_area_action_bar() {
		this.grid_nested_list_views_layout_beyond_safe_area({ actionBar: true });
	}

	public test_grid_nested_list_views_layout_in_safe_area_action_bar_hidden() {
		this.grid_nested_list_views_layout_beyond_safe_area({ actionBarHidden: true });
	}

	public test_grid_nested_list_views_layout_in_safe_area_action_bar_flat() {
		this.grid_nested_list_views_layout_beyond_safe_area({ actionBarFlat: true });
	}

	public test_grid_nested_list_views_layout_in_safe_area_tab_bar() {
		this.grid_nested_list_views_layout_beyond_safe_area({ tabBar: true });
	}
}

function setBindingContext(list: ListView) {
	return function () {
		const page = list.page;
		page.bindingContext = new ViewModel();
	};
}

export function createTestCase(): ListViewSafeAreaTest {
	return new ListViewSafeAreaTest();
}
