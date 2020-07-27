import * as TKUnit from '../../tk-unit';
import * as view from '@nativescript/core/ui/core/view';
import * as testModule from '../../ui-test';
import * as platform from '@nativescript/core/platform';
import * as helper from '../../ui-helper';
import { Builder, Page, Label, GridLayout } from '@nativescript/core';
import { dipToDp, left, top, right, bottom, height, width, equal, closeEnough, lessOrCloseEnough, greaterOrCloseEnough, isLeftAlignedWith, isRightAlignedWith, isTopAlignedWith, isBottomAlignedWith, isLeftWith, isAboveWith, isRightWith, isBelowWith } from './layout-tests-helper';

export class SafeAreaTests extends testModule.UITest<any> {
	public create(): any {
		return null;
	}

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

	public test_layout_changed_event_count() {
		const page = <Page>Builder.parse(`
        <Page>
            <GridLayout id="grid" backgroundColor="Crimson">
                <Label id="label" text="label1" backgroundColor="Gold"></Label>
            </GridLayout>
        </Page>
        `);
		let gridLayoutChangedCounter = 0;
		let labelLayoutChangedCounter = 0;
		const grid = page.getViewById('grid');
		grid.on(view.View.layoutChangedEvent, () => {
			gridLayoutChangedCounter++;
		});
		const label = <Label>page.getViewById('label');
		label.on(view.View.layoutChangedEvent, () => {
			labelLayoutChangedCounter++;
		});
		helper.navigate(() => page);
		label.height = 100;
		TKUnit.waitUntilReady(() => labelLayoutChangedCounter === 2);
		TKUnit.assert(gridLayoutChangedCounter === 1, `${grid} layoutChanged event count - actual:${gridLayoutChangedCounter}; expected: 1`);
	}

	// Common
	private getViews(template: string) {
		let root = Builder.parse(template);

		return {
			root,
			child0: root.getViewById('child0') as view.View,
			child1: root.getViewById('child1') as view.View,
			child2: root.getViewById('child2') as view.View,
		};
	}

	private layout_insets_top_action_bar_test(layout: view.View) {
		const app = UIApplication.sharedApplication;
		const statusBarHeight = round(dipToDp(app.statusBarFrame.size.height));
		const actionBarHeight = round(dipToDp(layout.page.actionBar.nativeViewProtected.frame.size.height));
		const topInset = statusBarHeight + actionBarHeight;

		const insets = layout.getSafeAreaInsets();
		equal(insets.top, topInset, `${layout}.topInset - actual:${insets.top}; expected: ${topInset}`);
	}

	private layout_insets_top_action_bar_hidden_test(layout: view.View) {
		const app = UIApplication.sharedApplication;
		const statusBarHeight = round(dipToDp(app.statusBarFrame.size.height));
		const topInset = statusBarHeight;

		const insets = layout.getSafeAreaInsets();
		equal(insets.top, topInset, `${layout}.topInset - actual:${insets.top}; expected: ${topInset}`);
	}

	private layout_in_full_screen_test(layout: view.View, pageOptions?: helper.PageOptions) {
		const l = left(layout);
		const t = top(layout);
		const r = right(layout);
		const b = bottom(layout);
		equal(l, 0, `${layout}.left - actual:${l}; expected: ${0}`);
		equal(t, 0, `${layout}.top - actual:${t}; expected: ${0}`);
		equal(r, platform.Screen.mainScreen.widthPixels, `${layout}.right - actual:${r}; expected: ${platform.Screen.mainScreen.widthPixels}`);
		equal(b, platform.Screen.mainScreen.heightPixels, `${layout}.bottom - actual:${b}; expected: ${platform.Screen.mainScreen.heightPixels}`);
	}

	// Absolute
	private absolute_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_absolute_in_full_screen_action_bar() {
		this.absolute_in_full_screen({ actionBar: true });
	}

	public test_absolute_in_full_screen_action_bar_hidden() {
		this.absolute_in_full_screen({ actionBarHidden: true });
	}

	public test_absolute_in_full_screen_action_bar_flat() {
		this.absolute_in_full_screen({ actionBarFlat: true });
	}

	public test_absolute_in_full_screen_tab_bar() {
		this.absolute_in_full_screen({ tabBar: true });
	}

	public test_absolute_in_full_screen_tab_bar_action_bar() {
		this.absolute_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_absolute_insets_top_action_bar() {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_absolute_insets_top_action_bar_hidden() {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_absolute_insets_top_action_bar_flat() {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_absolute_insets_top_tab_bar_flat() {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_absolute_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private absolute_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <AbsoluteLayout id="abs">
            <Button id="child0" text="Left: 0, Top: 0" left="0" top="0" backgroundColor="red" />
            <Button text="Left: 30, Top: 80" left="30" top="80" backgroundColor="green" />
            <Button text="Left: 150, Top: 25" left="150" top="25" backgroundColor="blue" />
            <Button text="Left: 70, Top: 150" left="70" top="150" backgroundColor="yellow" />
        </AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0 }) => {
				const insets = root.getSafeAreaInsets();
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
			},
			pageOptions
		);
	}

	public test_absolute_children_components_in_safe_area_action_bar() {
		this.absolute_children_components_in_safe_area({ actionBar: true });
	}

	public test_absolute_children_components_in_safe_area_action_bar_hidden() {
		this.absolute_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_absolute_children_components_in_safe_area_tab_bar() {
		this.absolute_children_components_in_safe_area({ tabBar: true });
	}

	private absolute_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <AbsoluteLayout id="abs">
            <AbsoluteLayout id="child0" left="0" top="0" backgroundColor="red">
                <Label text="Left: 0, Top: 0" />
            </AbsoluteLayout>
            <AbsoluteLayout left="30" top="80" backgroundColor="green">
                <Label text="Left: 30, Top: 80" />
            </AbsoluteLayout>
            <AbsoluteLayout left="150" top="25" backgroundColor="blue">
                <Label text="Left: 150, Top: 25" />
            </AbsoluteLayout>
            <AbsoluteLayout left="70" top="150" backgroundColor="yellow">
                <Label text="Left: 70, Top: 150"  />
            </AbsoluteLayout>
        </AbsoluteLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0 }) => {
				isLeftAlignedWith(root, child0);
				isTopAlignedWith(root, child0);
			},
			pageOptions
		);
	}

	public test_absolute_nested_layouts_beyond_safe_area_action_bar() {
		this.absolute_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_absolute_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.absolute_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_absolute_nested_layouts_beyond_safe_area_tab_bar() {
		this.absolute_nested_layouts_beyond_safe_area({ tabBar: true });
	}

	// Dock
	private getDockViews(template: string) {
		let root = Builder.parse(template);

		return {
			root,
			childLeft: root.getViewById('childLeft') as view.View,
			childTop: root.getViewById('childTop') as view.View,
			childRight: root.getViewById('childRight') as view.View,
			childBottom: root.getViewById('childBottom') as view.View,
			childFill: root.getViewById('childFill') as view.View,
		};
	}

	private dock_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getDockViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_dock_in_full_screen_action_bar() {
		this.dock_in_full_screen({ actionBar: true });
	}

	public test_dock_in_full_screen_action_bar_hidden() {
		this.dock_in_full_screen({ actionBarHidden: true });
	}

	public test_dock_in_full_screen_action_bar_flat() {
		this.dock_in_full_screen({ actionBarFlat: true });
	}

	public test_dock_in_full_screen_tab_bar() {
		this.dock_in_full_screen({ tabBar: true });
	}

	public test_dock_in_full_screen_tab_bar_action_bar() {
		this.dock_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_dock_insets_top_action_bar() {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_dock_insets_top_action_bar_hidden() {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_dock_insets_top_action_bar_flat() {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_dock_insets_top_tab_bar_flat() {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_dock_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private dock_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <DockLayout id="dock" stretchLastChild="true">
            <Label id="childLeft" dock="Left" text="left" backgroundColor="red" />
            <Label id="childTop" dock="Top" text="top" backgroundColor="green" />
            <Label id="childRight" dock="Right" text="right" backgroundColor="blue" />
            <Label id="childBottom" dock="Bottom" text="bottom" backgroundColor="yellow" />
            <Label id="childFill" text="fill"/>
        </DockLayout>
        `;

		this.executeSnippet(
			this.getDockViews(snippet),
			this.noop,
			({ root, childLeft, childTop, childRight, childBottom, childFill }) => {
				const insets = root.getSafeAreaInsets();

				equal(left(childLeft), insets.left, `${childLeft}.left - actual: ${left(childLeft)} expected: ${insets.left}`);
				equal(top(childLeft), insets.top, `${childLeft}.top - actual: ${top(childLeft)} expected: ${insets.top}`);

				equal(top(childTop), insets.top, `${childTop}.top - actual: ${top(childTop)} expected: ${insets.top}`);
				equal(right(childTop), width(root) - insets.right, `${childTop}.right - actual: ${right(childTop)} expected: ${width(root) - insets.right}`);

				equal(right(childRight), width(root) - insets.right, `${childRight}.right - actual: ${right(childRight)} expected: ${width(root) - insets.right}`);
				equal(bottom(childRight), height(root) - insets.bottom, `${childRight}.bottom - actual: ${bottom(childRight)} expected: ${height(root) - insets.bottom}`);

				equal(bottom(childBottom), height(root) - insets.bottom, `${childBottom}.bottom - actual: ${bottom(childBottom)} expected: ${height(root) - insets.bottom}`);

				isLeftWith(childLeft, childFill, width(childLeft));
				isBelowWith(childTop, childFill, height(childTop));
				isRightWith(childFill, childRight, width(childRight));
				isAboveWith(childFill, childBottom, height(childBottom));
			},
			pageOptions
		);
	}

	public test_dock_children_components_in_safe_area_action_bar() {
		this.dock_children_components_in_safe_area({ actionBar: true });
	}

	public test_dock_children_components_in_safe_area_action_bar_hidden() {
		this.dock_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_dock_children_components_in_safe_area_tab_bar() {
		this.dock_children_components_in_safe_area({ tabBar: true });
	}

	private dock_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <DockLayout id="dock" stretchLastChild="true">
            <DockLayout id="childLeft" dock="Left" text="left" backgroundColor="red">
                <Label text="left"/>
            </DockLayout>
            <DockLayout id="childTop" dock="Top" text="top" backgroundColor="green">
                <Label text="top" />
            </DockLayout>
            <DockLayout id="childRight" dock="Right" text="right" backgroundColor="blue">
                <Label text="right" />
            </DockLayout>
            <DockLayout id="childBottom" dock="Bottom" text="bottom" backgroundColor="yellow">
                <Label text="bottom" />
            </DockLayout>
            <DockLayout id="childFill" text="fill">
                <Label text="fill" />
            </DockLayout>
        </DockLayout>
        `;

		this.executeSnippet(
			this.getDockViews(snippet),
			this.noop,
			({ root, childLeft, childTop, childRight, childBottom, childFill }) => {
				isLeftAlignedWith(root, childLeft);
				isTopAlignedWith(root, childLeft);

				isTopAlignedWith(root, childTop);
				isRightAlignedWith(root, childTop);

				isRightAlignedWith(root, childRight);
				isBottomAlignedWith(root, childRight);

				isBottomAlignedWith(root, childRight);

				const sumOfNestedDockHeights = height(childTop) + height(childFill) + height(childBottom);
				equal(height(root), sumOfNestedDockHeights, `dock height<${height(root)}> sum of nested docks height <${sumOfNestedDockHeights}>`);

				const sumOfNestedDockWidths = width(childLeft) + width(childFill) + width(childRight);
				equal(width(root), sumOfNestedDockWidths, `dock width<${width(root)}> sum of nested docks width <${sumOfNestedDockWidths}>`);
			},
			pageOptions
		);
	}

	public test_dock_nested_layouts_beyond_safe_area_action_bar() {
		this.dock_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_dock_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.dock_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_dock_nested_layouts_beyond_safe_area_tab_bar() {
		this.dock_nested_layouts_beyond_safe_area({ tabBar: true });
	}

	// Flexbox
	private flexbox_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_flexbox_in_full_screen_action_bar() {
		this.flexbox_in_full_screen({ actionBar: true });
	}

	public test_flexbox_in_full_screen_action_bar_hidden() {
		this.flexbox_in_full_screen({ actionBarHidden: true });
	}

	public test_flexbox_in_full_screen_action_bar_flat() {
		this.flexbox_in_full_screen({ actionBarFlat: true });
	}

	public test_flexbox_in_full_screen_tab_bar() {
		this.flexbox_in_full_screen({ tabBar: true });
	}

	public test_flexbox_in_full_screen_tab_bar_action_bar() {
		this.flexbox_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_flexbox_insets_top_action_bar() {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_flexbox_insets_top_action_bar_hidden() {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_flexbox_insets_top_action_bar_flat() {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_flexbox_insets_top_tab_bar_flat() {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_flexbox_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <FlexboxLayout id="flex" backgroundColor="Crimson"></FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private flex_column_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <FlexboxLayout id="flex" flexDirection="column" backgroundColor="Crimson">
            <Label id="child0" backgroundColor="white" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat." />
            <Label id="child1" flexGrow="1" backgroundColor="green" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat." />
            <Label id="child2" backgroundColor="red" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat." />
        </FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child2 }) => {
				const insets = root.getSafeAreaInsets();

				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
				equal(right(child0), width(root) - insets.right, `${child0}.right - actual: ${right(child0)} expected: ${width(root) - insets.right}`);

				equal(right(child2), width(root) - insets.right, `${child2}.right - actual: ${right(child2)} expected: ${width(root) - insets.right}`);
				equal(bottom(child2), height(root) - insets.bottom, `${child2}.bottom - actual: ${bottom(child2)} expected: ${height(root) - insets.bottom}`);
				equal(right(child2), width(root) - insets.right, `${child2}.right - actual: ${right(child2)} expected: ${width(root) - insets.right}`);
			},
			pageOptions
		);
	}

	public test_flex_column_children_components_in_safe_area_action_bar() {
		this.flex_column_children_components_in_safe_area({ actionBar: true });
	}

	public test_flex_column_children_components_in_safe_area_action_bar_hidden() {
		this.flex_column_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_flex_column_children_components_in_safe_area_tab_bar() {
		this.flex_column_children_components_in_safe_area({ tabBar: true });
	}

	private flex_row_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <FlexboxLayout id="flex" flexDirection="row" backgroundColor="Crimson">
            <Label id="child0" backgroundColor="white" text="Lorem" />
            <Label id="child1" flexGrow="1" backgroundColor="green" text="Lorem" />
            <Label id="child2" backgroundColor="red" text="Lorem" />
        </FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child2 }) => {
				const insets = root.getSafeAreaInsets();

				equal(bottom(child0), height(root) - insets.bottom, `${child0}.bottom - actual: ${bottom(child0)} expected: ${height(root) - insets.bottom}`);
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);

				equal(top(child2), insets.top, `${child2}.top - actual: ${top(child2)} expected: ${insets.top}`);
				equal(right(child2), width(root) - insets.right, `${child2}.right - actual: ${right(child2)} expected: ${width(root) - insets.right}`);
				equal(bottom(child2), height(root) - insets.bottom, `${child2}.bottom - actual: ${bottom(child2)} expected: ${height(root) - insets.bottom}`);
			},
			pageOptions
		);
	}

	public test_flex_row_children_components_in_safe_area_action_bar() {
		this.flex_row_children_components_in_safe_area({ actionBar: true });
	}

	public test_flex_row_children_components_in_safe_area_action_bar_hidden() {
		this.flex_row_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_flex_row_children_components_in_safe_area_tab_bar() {
		this.flex_row_children_components_in_safe_area({ tabBar: true });
	}

	private flex_column_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <FlexboxLayout id="flex" flexDirection="column">
            <StackLayout id="child0" backgroundColor="white">
                <Label text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat."></Label>
            </StackLayout>
            <StackLayout id="child1" flexGrow="1" backgroundColor="green">
                <Label text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat."></Label>
            </StackLayout>
            <StackLayout id="child2" backgroundColor="red">
                <Label text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis euismod fermentum erat, eu vehicula nunc scelerisque quis. Aenean consequat elit sed lacus aliquam consequat."></Label>
            </StackLayout>
        </FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1, child2 }) => {
				isLeftAlignedWith(root, child0);
				isTopAlignedWith(root, child0);
				isRightAlignedWith(root, child0);

				isLeftAlignedWith(root, child2);
				isBottomAlignedWith(root, child2);
				isRightAlignedWith(root, child2);

				const sumOfChildrenHeights = height(child0) + height(child1) + height(child2);
				equal(height(root), sumOfChildrenHeights, `flex height <${height(root)}> is NOT equal to sum of its children's heights <${sumOfChildrenHeights}>`);
			},
			pageOptions
		);
	}

	public test_flex_column_nested_layouts_beyond_safe_area_action_bar() {
		this.flex_column_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_flex_column_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.flex_column_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_flex_column_nested_layouts_beyond_safe_area_tab_bar() {
		this.flex_column_nested_layouts_beyond_safe_area({ tabBar: true });
	}

	private flex_row_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <FlexboxLayout id="flex" flexDirection="row">
            <StackLayout id="child0" backgroundColor="white">
                <Label text="Lorem"></Label>
            </StackLayout>
            <StackLayout id="child1" flexGrow="1" backgroundColor="green">
                <Label text="Lorem"></Label>
            </StackLayout>
            <StackLayout id="child2" backgroundColor="red">
                <Label text="Lorem"></Label>
            </StackLayout>
        </FlexboxLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1, child2 }) => {
				isBottomAlignedWith(root, child0);
				isLeftAlignedWith(root, child0);
				isTopAlignedWith(root, child0);

				isTopAlignedWith(root, child2);
				isRightAlignedWith(root, child2);
				isBottomAlignedWith(root, child2);

				const sumOfChildrenWidths = width(child0) + width(child1) + width(child2);
				equal(width(root), sumOfChildrenWidths, `flex width <${width(root)}> is NOT equal to sum of its children's width <${sumOfChildrenWidths}>`);
			},
			pageOptions
		);
	}

	public test_flex_row_nested_layouts_beyond_safe_area_action_bar() {
		this.flex_row_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_flex_row_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.flex_row_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_flex_row_nested_layouts_beyond_safe_area_tab_bar() {
		this.flex_row_nested_layouts_beyond_safe_area({ tabBar: true });
	}

	// Grid
	private getGridViews(template: string) {
		let root = Builder.parse(template);

		return {
			root,
			grid: root.getViewById('grid') as GridLayout,
			cells: [
				[root.getViewById('cell00') as view.View, root.getViewById('cell01') as view.View, root.getViewById('cell02') as view.View],
				[root.getViewById('cell10') as view.View, root.getViewById('cell11') as view.View, root.getViewById('cell12') as view.View],
				[root.getViewById('cell20') as view.View, root.getViewById('cell21') as view.View, root.getViewById('cell22') as view.View],
			],
		};
	}

	private grid_layout_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getGridViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_grid_layout_in_full_screen_action_bar() {
		this.grid_layout_in_full_screen({ actionBar: true });
	}

	public test_grid_layout_in_full_screen_action_bar_hidden() {
		this.grid_layout_in_full_screen({ actionBarHidden: true });
	}

	public test_grid_layout_in_full_screen_action_bar_flat() {
		this.grid_layout_in_full_screen({ actionBarFlat: true });
	}

	public test_grid_layout_in_full_screen_tab_bar() {
		this.grid_layout_in_full_screen({ tabBar: true });
	}

	public test_grid_layout_in_full_screen_tab_bar_action_bar() {
		this.grid_layout_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_grid_insets_top_action_bar() {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_grid_insets_top_action_bar_hidden() {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_grid_insets_top_action_bar_flat() {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_grid_insets_top_tab_bar_flat() {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_grid_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private grid_component_cells_layout_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <Label row="0" col="0" id="cell00" text="overflowing text, overflowing text"></Label>
            <Label row="0" col="1" id="cell01" text="overflowing text, overflowing text"></Label>
            <Label row="0" col="2" id="cell02" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="0" id="cell10" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="1" id="cell11" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="2" id="cell12" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="0" id="cell20" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="1" id="cell21" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="2" id="cell22" text="overflowing text, overflowing text"></Label>
        </GridLayout>
        `;

		this.executeSnippet(
			this.getGridViews(snippet),
			this.noop,
			({ root, grid, cells }) => {
				const insets = root.getSafeAreaInsets();

				equal(left(cells[0][0]), insets.left, `cell00 left actual:<${left(cells[0][0])}> expected:<${insets.left}>`);
				equal(left(cells[1][0]), insets.left, `cell10 left actual:<${left(cells[1][0])}> expected:<${insets.left}>`);
				equal(left(cells[2][0]), insets.left, `cell20 left actual:<${left(cells[2][0])}> expected:<${insets.left}>`);

				isBelowWith(grid, cells[0][0], insets.top);
				isBelowWith(grid, cells[0][1], insets.top);
				isBelowWith(grid, cells[0][2], insets.top);

				equal(right(cells[0][2]), width(grid) - insets.right, `cell02 left actual:<${left(cells[0][2])}> expected:<${width(grid) - insets.right}>`);
				equal(right(cells[1][2]), width(grid) - insets.right, `cell12 left actual:<${left(cells[1][2])}> expected:<${width(grid) - insets.right}>`);
				equal(right(cells[2][2]), width(grid) - insets.right, `cell22 left actual:<${left(cells[2][2])}> expected:<${width(grid) - insets.right}>`);

				isAboveWith(cells[2][0], grid, insets.bottom);
				isAboveWith(cells[2][1], grid, insets.bottom);
				isAboveWith(cells[2][2], grid, insets.bottom);

				closeEnough(height(cells[0][1]), height(cells[1][1]), `cell height should be equal - cell01<${height(cells[0][1])}> - cell11<${height(cells[1][1])}>`);
				closeEnough(height(cells[1][1]), height(cells[2][1]), `cell height should be equal - cell11<${height(cells[1][1])}> - cell21<${height(cells[2][1])}>`);
				const sumOfLabelHeightAndInsets = insets.top + height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]) + insets.bottom;
				closeEnough(height(grid), sumOfLabelHeightAndInsets, `grid height<${height(grid)}> sum of labels height and insets<${sumOfLabelHeightAndInsets}>`);

				closeEnough(width(cells[1][0]), width(cells[1][1]), `cell width should be equal - cell10<${width(cells[1][0])}> - cell11<${width(cells[1][1])}>`);
				closeEnough(width(cells[1][1]), width(cells[1][2]), `cell width should be equal - cell11<${width(cells[1][1])}> - cell12<${width(cells[1][2])}>`);
				const sumOfLabelWidthsAndInsets = insets.left + width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2]) + insets.right;
				equal(width(grid), sumOfLabelWidthsAndInsets, `grid width<${width(grid)}> sum of nested grids width and insets<${sumOfLabelWidthsAndInsets}>`);
			},
			pageOptions
		);
	}

	public test_grid_component_cells_layout_in_safe_area_action_bar() {
		this.grid_component_cells_layout_in_safe_area({ actionBar: true });
	}

	public test_grid_component_cells_layout_in_safe_area_action_bar_hidden() {
		this.grid_component_cells_layout_in_safe_area({ actionBarHidden: true });
	}

	public test_grid_component_cells_layout_in_safe_area_tab_bar() {
		this.grid_component_cells_layout_in_safe_area({ tabBar: true });
	}

	private grid_nested_grid_cells_layout_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <GridLayout row="0" col="0" id="cell00" backgroundColor="SkyBlue"></GridLayout>
            <GridLayout row="0" col="1" id="cell01" backgroundColor="Indigo"></GridLayout>
            <GridLayout row="0" col="2" id="cell02" backgroundColor="Crimson"></GridLayout>
            <GridLayout row="1" col="0" id="cell10" backgroundColor="Chocolate"></GridLayout>
            <GridLayout row="1" col="1" id="cell11" backgroundColor="Cornsilk"></GridLayout>
            <GridLayout row="1" col="2" id="cell12" backgroundColor="BurlyWood"></GridLayout>
            <GridLayout row="2" col="0" id="cell20" backgroundColor="GoldenRod"></GridLayout>
            <GridLayout row="2" col="1" id="cell21" backgroundColor="Khaki"></GridLayout>
            <GridLayout row="2" col="2" id="cell22" backgroundColor="IndianRed"></GridLayout>
        </GridLayout>
        `;

		this.executeSnippet(
			this.getGridViews(snippet),
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

				const sumOfNestedGridHeights = height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]);
				equal(height(grid), sumOfNestedGridHeights, `grid height<${height(grid)}> sum of nested grids height <${sumOfNestedGridHeights}>`);

				greaterOrCloseEnough(width(cells[1][0]), width(cells[1][1]), `cell10 width<${width(cells[1][0])}> not greater or close enough cell11 width<${width(cells[1][1])}>`);
				lessOrCloseEnough(width(cells[1][1]), width(cells[1][2]), `cell11 width<${width(cells[1][1])}> not less or close enough cell12 width<${width(cells[1][2])}>`);

				const sumOfNestedGridWidths = width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2]);
				equal(width(grid), sumOfNestedGridWidths, `grid width<${width(grid)}> sum of nested grids width <${sumOfNestedGridWidths}>`);
			},
			pageOptions
		);
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_action_bar() {
		this.grid_nested_grid_cells_layout_beyond_safe_area({ actionBar: true });
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_action_bar_hidden() {
		this.grid_nested_grid_cells_layout_beyond_safe_area({ actionBarHidden: true });
	}

	public test_grid_nested_grid_cells_layout_beyond_safe_area_tab_bar() {
		this.grid_nested_grid_cells_layout_beyond_safe_area({ tabBar: true });
	}

	// Stack
	private stack_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_stack_in_full_screen_action_bar() {
		this.stack_in_full_screen({ actionBar: true });
	}

	public test_stack_in_full_screen_action_bar_hidden() {
		this.stack_in_full_screen({ actionBarHidden: true });
	}

	public test_stack_in_full_screen_action_bar_flat() {
		this.stack_in_full_screen({ actionBarFlat: true });
	}

	public test_stack_in_full_screen_tab_bar() {
		this.stack_in_full_screen({ tabBar: true });
	}

	public test_stack_in_full_screen_tab_bar_action_bar() {
		this.stack_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_stack_insets_top_action_bar() {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_stack_insets_top_action_bar_hidden() {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_stack_insets_top_action_bar_flat() {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_stack_insets_top_tab_bar_flat() {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_stack_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private stack_horizontal_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <StackLayout id="stack" orientation="horizontal" backgroundColor="Crimson">
            <Label id="child0" text="123"></Label>
            <Label id="child1" text="456"></Label>
        </StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1 }) => {
				const insets = root.getSafeAreaInsets();
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
				equal(bottom(child0), height(root) - insets.bottom, `${child0}.bottom - actual: ${bottom(child0)} expected: ${height(root) - insets.bottom}`);
				isLeftWith(child0, child1, width(child0));
			},
			pageOptions
		);
	}

	public test_stack_horizontal_children_components_in_safe_area_action_bar() {
		this.stack_horizontal_children_components_in_safe_area({ actionBar: true });
	}

	public test_stack_horizontal_children_components_in_safe_area_action_bar_hidden() {
		this.stack_horizontal_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_stack_horizontal_children_components_in_safe_area_tab_bar() {
		this.stack_horizontal_children_components_in_safe_area({ tabBar: true });
	}

	private stack_vertical_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <StackLayout id="stack" orientation="vertical" backgroundColor="Crimson">
            <Label id="child0" text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label id="child1" text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
        </StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1 }) => {
				const insets = root.getSafeAreaInsets();
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
				equal(right(child0), width(root) - insets.right, `${child0}.right - actual: ${right(child0)} expected: ${width(root) - insets.right}`);
				isBelowWith(child0, child1, height(child0));
			},
			pageOptions
		);
	}

	public test_stack_vertical_children_components_in_safe_area_action_bar() {
		this.stack_vertical_children_components_in_safe_area({ actionBar: true });
	}

	public test_stack_vertical_children_components_in_safe_area_action_bar_hidden() {
		this.stack_vertical_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_stack_vertical_children_components_in_safe_area_tab_bar() {
		this.stack_vertical_children_components_in_safe_area({ tabBar: true });
	}

	private stack_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson">
            <StackLayout id="child0" backgroundColor="GoldenRod">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
        </StackLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0 }) => {
				isLeftAlignedWith(root, child0);
				isTopAlignedWith(root, child0);
				isRightAlignedWith(root, child0);
			},
			pageOptions
		);
	}

	public test_stack_nested_layouts_beyond_safe_area_action_bar() {
		this.stack_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_stack_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.stack_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_stack_nested_layouts_beyond_safe_area_tab_bar() {
		this.stack_nested_layouts_beyond_safe_area({ tabBar: true });
	}

	// Wrap
	private wrap_in_full_screen(pageOptions?: helper.PageOptions) {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_in_full_screen_test(root, pageOptions);
			},
			pageOptions
		);
	}

	public test_wrap_in_full_screen_action_bar() {
		this.wrap_in_full_screen({ actionBar: true });
	}

	public test_wrap_in_full_screen_action_bar_hidden() {
		this.wrap_in_full_screen({ actionBarHidden: true });
	}

	public test_wrap_in_full_screen_action_bar_flat() {
		this.wrap_in_full_screen({ actionBarFlat: true });
	}

	public test_wrap_in_full_screen_tab_bar() {
		this.wrap_in_full_screen({ tabBar: true });
	}

	public test_wrap_in_full_screen_tab_bar_action_bar() {
		this.wrap_in_full_screen({ actionBar: true, tabBar: true });
	}

	public test_wrap_insets_top_action_bar() {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true }
		);
	}

	public test_wrap_insets_top_action_bar_hidden() {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ actionBarHidden: true }
		);
	}

	public test_wrap_insets_top_action_bar_flat() {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBarFlat: true }
		);
	}

	public test_wrap_insets_top_tab_bar_flat() {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_hidden_test(root);
			},
			{ tabBar: true }
		);
	}

	public test_wrap_insets_top_tab_bar_action_bar_flat() {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson"></WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root }) => {
				this.layout_insets_top_action_bar_test(root);
			},
			{ actionBar: true, tabBar: true }
		);
	}

	private wrap_horizontal_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <WrapLayout id="wrap" orientation="horizontal" backgroundColor="Crimson">
            <Button id="child0" text="Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet." height="100%"></Button>
            <Button id="child1" text="H" backgroundColor="Pink"></Button>
        </WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1 }) => {
				const insets = root.getSafeAreaInsets();
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
				equal(right(child0), width(root) - insets.right, `${child0}.right - actual: ${right(child0)} expected: ${width(root) - insets.right}`);
				equal(bottom(child0), height(root) - insets.bottom, `${child0}.bottom - actual: ${bottom(child0)} expected: ${height(root) - insets.bottom}`);
				equal(height(child1), 0, `${child1} has been laid out, but should not`);
				equal(width(child1), 0, `${child1} has been laid out, but should not`);
			},
			pageOptions
		);
	}

	public test_wrap_horizontal_children_components_in_safe_area_action_bar() {
		this.wrap_horizontal_children_components_in_safe_area({ actionBar: true });
	}

	public test_wrap_horizontal_children_components_in_safe_area_action_bar_hidden() {
		this.wrap_horizontal_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_wrap_horizontal_children_components_in_safe_area_tab_bar() {
		this.wrap_horizontal_children_components_in_safe_area({ tabBar: true });
	}

	private wrap_vertical_children_components_in_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <WrapLayout id="wrap" orientation="vertical" backgroundColor="Crimson">
            <Button id="child0" text="Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet." height="100%"></Button>
            <Button id="child1" text="V" backgroundColor="Pink"></Button>
        </WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0, child1 }) => {
				const insets = root.getSafeAreaInsets();
				equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
				equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
				equal(right(child0), width(root) - insets.right, `${child0}.right - actual: ${right(child0)} expected: ${width(root) - insets.right}`);
				equal(bottom(child0), height(root) - insets.bottom, `${child0}.bottom - actual: ${bottom(child0)} expected: ${height(root) - insets.bottom}`);
				equal(height(child1), 0, `${child1} has been laid out, but should not`);
				equal(width(child1), 0, `${child1} has been laid out, but should not`);
			},
			pageOptions
		);
	}

	public test_wrap_vertical_children_components_in_safe_area_action_bar() {
		this.wrap_vertical_children_components_in_safe_area({ actionBar: true });
	}

	public test_wrap_vertical_children_components_in_safe_area_action_bar_hidden() {
		this.wrap_vertical_children_components_in_safe_area({ actionBarHidden: true });
	}

	public test_wrap_vertical_children_components_in_safe_area_tab_bar() {
		this.wrap_vertical_children_components_in_safe_area({ tabBar: true });
	}

	private wrap_nested_layouts_beyond_safe_area(pageOptions?: helper.PageOptions) {
		const snippet = `
        <WrapLayout id="wrap" backgroundColor="Crimson">
            <WrapLayout id="child0" backgroundColor="SkyBlue">
                <Button text="Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet."/>
            </WrapLayout>
        </WrapLayout>
        `;

		this.executeSnippet(
			this.getViews(snippet),
			this.noop,
			({ root, child0 }) => {
				isLeftAlignedWith(root, child0);
				isTopAlignedWith(root, child0);
				isRightAlignedWith(root, child0);
			},
			pageOptions
		);
	}

	public test_wrap_nested_layouts_beyond_safe_area_action_bar() {
		this.wrap_nested_layouts_beyond_safe_area({ actionBar: true });
	}

	public test_wrap_nested_layouts_beyond_safe_area_action_bar_hidden() {
		this.wrap_nested_layouts_beyond_safe_area({ actionBarHidden: true });
	}

	public test_wrap_nested_layouts_beyond_safe_area_tab_bar() {
		this.wrap_nested_layouts_beyond_safe_area({ tabBar: true });
	}
}

export function createTestCase(): SafeAreaTests {
	return new SafeAreaTests();
}
