import * as TKUnit from '../../tk-unit';
import { Button } from '@nativescript/core/ui/button';
import { Page, isIOS } from '@nativescript/core';
import { UITest } from '../../ui-test';
import * as layoutHelper from '../layouts/layout-helper';
import * as helper from '../../ui-helper';

// >> article-require-scrollview-module
import { ScrollView, ScrollEventData } from '@nativescript/core/ui/scroll-view';
// << article-require-scrollview-module

class ScrollLayoutTest extends UITest<ScrollView> {
	public create(): ScrollView {
		const scrollView = new ScrollView();
		scrollView.orientation = 'vertical';

		scrollView.width = { value: 200, unit: 'px' };
		scrollView.height = { value: 300, unit: 'px' };

		const btn = new Button();
		btn.text = 'test';
		btn.width = { value: 500, unit: 'px' };
		btn.height = { value: 500, unit: 'px' };
		scrollView.content = btn;

		// Use page with scrollableContent disabled for scroll-view tests
		(<any>this.testPage).scrollableContent = false;

		return scrollView;
	}

	public test_snippets() {
		// >> article-creating-scrollview
		const scrollView = new ScrollView();
		// << article-creating-scrollview
		TKUnit.assertTrue(scrollView !== null, 'ScrollView should be created.');
	}

	public test_default_TNS_values() {
		const scroll = new ScrollView();
		TKUnit.assertEqual(scroll.orientation, 'vertical', 'Default this.testView.orientation');
		TKUnit.assertEqual(scroll.verticalOffset, 0, 'Default this.testView.verticalOffset');
		TKUnit.assertEqual(scroll.horizontalOffset, 0, 'Default this.testView.horizontalOffset');
	}

	public test_vertical_oriantation_creates_correct_native_view() {
		this.testView.orientation = 'vertical';

		if (isIOS) {
			TKUnit.assert(this.testView.ios instanceof UIScrollView, 'ios property is UIScrollView');
		} else {
			TKUnit.assert(this.testView.android instanceof org.nativescript.widgets.VerticalScrollView, 'android property should be instanceof org.nativescript.widgets.VerticalScrollView');
		}
	}

	public test_horizontal_oriantation_creates_correct_native_view() {
		this.testView.orientation = 'horizontal';

		if (isIOS) {
			TKUnit.assert(this.testView.ios instanceof UIScrollView, 'ios property is UIScrollView');
		} else {
			TKUnit.assert(this.testView.android instanceof org.nativescript.widgets.HorizontalScrollView, 'android property should be instanceof org.nativescript.widgets.HorizontalScrollView');
		}
	}

	public test_scrollableHeight_vertical_orientation_when_content_is_small() {
		this.testView.content.width = { value: 100, unit: 'px' };
		this.testView.content.height = { value: 100, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.scrollableHeight, 0, 'this.testView.scrollableHeight');
		TKUnit.assertEqual(this.testView.scrollableWidth, 0, 'this.testView.scrollableWidth');
	}

	public test_scrollableHeight_vertical_orientation_when_content_is_big() {
		this.testView.content.width = { value: 100, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertAreClose(layoutHelper.dip(this.testView.scrollableHeight), 200, 0.4, 'this.testView.scrollableHeight');
		TKUnit.assertEqual(this.testView.scrollableWidth, 0, 'this.testView.scrollableWidth');
	}

	public test_scrollableWidth_horizontal_orientation_when_content_is_small() {
		this.testView.orientation = 'horizontal';
		this.testView.content.width = { value: 100, unit: 'px' };
		this.testView.content.height = { value: 100, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.scrollableHeight, 0, 'this.testView.scrollableHeight');
		TKUnit.assertEqual(this.testView.scrollableWidth, 0, 'this.testView.scrollableWidth');
	}

	public test_scrollableWidth_horizontal_orientation_when_content_is_big() {
		this.testView.orientation = 'horizontal';
		this.testView.content.height = { value: 100, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.scrollableHeight, 0, 'this.testView.scrollableHeight');
		TKUnit.assertAreClose(layoutHelper.dip(this.testView.scrollableWidth), 300, 0.4, 'this.testView.scrollableWidth');
	}

	public test_scrollToVerticalOffset_no_animation() {
		TKUnit.assertEqual(this.testView.verticalOffset, 0, 'this.testView.verticalOffset');
		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
		TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.1, 'this.testView.verticalOffset');
	}

	public test_scrollToVerticalOffset_with_animation() {
		TKUnit.assertEqual(this.testView.verticalOffset, 0, 'this.testView.verticalOffset');
		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToVerticalOffset(layoutHelper.dp(100), true);
		TKUnit.waitUntilReady(() => TKUnit.areClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.9));

		// The scrolling animation should be finished by now
		TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.9, 'this.testView.verticalOffset');
	}

	public test_scrollToHorizontalOffset_no_animation() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.horizontalOffset, 0, 'this.testView.horizontalOffset');
		this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
		TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.1, 'this.testView.horizontalOffset');
	}

	public test_scrollToHorizontalOffset_with_animation() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.horizontalOffset, 0, 'this.testView.horizontalOffset');
		this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), true);

		// No synchronous change.
		TKUnit.assertEqual(this.testView.horizontalOffset, 0, 'this.testView.horizontalOffset');

		TKUnit.waitUntilReady(() => TKUnit.areClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.9));

		// The scrolling animation should be finished by now
		TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.9, 'this.testView.horizontalOffset');
	}

	public test_scrollView_persistsState_vertical() {
		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToVerticalOffset(90, false);
		this.waitUntilTestElementLayoutIsValid();

		const offset = Math.floor(this.testView.verticalOffset);
		// assert we did scroll;
		TKUnit.assertTrue(offset > 22, 'this.testView.verticalOffset before navigation should be >22');

		helper.navigateWithHistory(() => new Page());
		helper.goBack();

		// Check verticalOffset after navigation
		TKUnit.assertEqual(Math.floor(this.testView.verticalOffset), offset, 'this.testView.verticalOffset after navigation');
	}

	public test_scrollView_persistsState_horizontal() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToHorizontalOffset(100, false);
		const offset = this.testView.horizontalOffset;
		// assert we did scroll;
		TKUnit.assertTrue(offset > 22, 'this.testView.horizontalOffset before navigation should be >22');

		helper.navigateWithHistory(() => new Page());
		helper.goBack();

		// Check horizontalOffset after navigation
		TKUnit.assertEqual(this.testView.horizontalOffset, offset, 'this.testView.horizontalOffset after navigation');
	}

	public test_scrollView_vertical_raised_scroll_event() {
		var scrollY: number;
		this.testView.on(ScrollView.scrollEvent, (args: ScrollEventData) => {
			scrollY = args.scrollY;
		});

		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
		TKUnit.waitUntilReady(function () {
			return scrollY > 0;
		});
		TKUnit.assertEqual(scrollY, this.testView.verticalOffset);
	}

	public test_scrollView_horizontal_raised_scroll_event() {
		this.testView.orientation = 'horizontal';

		var scrollX: number;
		this.testView.on(ScrollView.scrollEvent, (args: ScrollEventData) => {
			scrollX = args.scrollX;
		});

		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
		TKUnit.waitUntilReady(function () {
			return scrollX > 0;
		});
		TKUnit.assertEqual(scrollX, this.testView.horizontalOffset);
	}

	public test_scrollView_vertical_raised_scroll_event_after_loaded() {
		this.waitUntilTestElementLayoutIsValid();

		var scrollY: number;
		this.testView.on(ScrollView.scrollEvent, (args: ScrollEventData) => {
			scrollY = args.scrollY;
		});

		this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
		TKUnit.waitUntilReady(function () {
			return scrollY > 0;
		});
		TKUnit.assertEqual(scrollY, this.testView.verticalOffset);
		TKUnit.assertEqual(scrollY, layoutHelper.dp(100));
	}

	public test_scrollView_horizontal_raised_scroll_event_after_loaded() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		var scrollX: number;
		this.testView.on(ScrollView.scrollEvent, (args: ScrollEventData) => {
			scrollX = args.scrollX;
		});

		this.waitUntilTestElementLayoutIsValid();

		this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
		TKUnit.waitUntilReady(function () {
			return scrollX > 0;
		});
		TKUnit.assertEqual(scrollX, this.testView.horizontalOffset);
		TKUnit.assertEqual(scrollX, layoutHelper.dp(100));
	}

	public test_scrollView_horizontal_can_set_indicator_state() {
		this.testView.orientation = 'horizontal';
		this.testView.scrollBarIndicatorVisible = true;
		this.waitUntilTestElementLayoutIsValid();

		if (isIOS) {
			TKUnit.assertEqual(this.testView.ios.showsHorizontalScrollIndicator, true);
		} else {
			TKUnit.assertEqual(this.testView.android.isHorizontalScrollBarEnabled(), true);
		}

		this.testView.scrollBarIndicatorVisible = false;
		this.waitUntilTestElementLayoutIsValid();

		if (isIOS) {
			TKUnit.assertEqual(this.testView.ios.showsHorizontalScrollIndicator, false);
		} else {
			TKUnit.assertEqual(this.testView.android.isHorizontalScrollBarEnabled(), false);
		}
	}

	public test_scrollView_vertical_can_set_indicator_state() {
		this.testView.orientation = 'vertical';
		this.testView.scrollBarIndicatorVisible = true;
		this.waitUntilTestElementLayoutIsValid();

		if (isIOS) {
			TKUnit.assertEqual(this.testView.ios.showsVerticalScrollIndicator, true);
		} else {
			TKUnit.assertEqual(this.testView.android.isVerticalScrollBarEnabled(), true);
		}

		this.testView.scrollBarIndicatorVisible = false;
		this.waitUntilTestElementLayoutIsValid();

		if (isIOS) {
			TKUnit.assertEqual(this.testView.ios.showsVerticalScrollIndicator, false);
		} else {
			TKUnit.assertEqual(this.testView.android.isVerticalScrollBarEnabled(), false);
		}
	}
}

export function createTestCase(): ScrollLayoutTest {
	return new ScrollLayoutTest();
}
