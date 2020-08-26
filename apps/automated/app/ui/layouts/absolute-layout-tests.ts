import * as testModule from '../../ui-test';
import * as TKUnit from '../../tk-unit';
import * as labelModule from '@nativescript/core/ui/label';
import * as colorModule from '@nativescript/core/color';
import * as layoutHelper from './layout-helper';
import * as commonTests from './common-layout-tests';
import * as helper from '../../ui-helper';

// >> absolute-layout-require
import * as absoluteLayoutModule from '@nativescript/core/ui/layouts/absolute-layout';
// << absolute-layout-require

export class AbsoluteLayoutTest extends testModule.UITest<absoluteLayoutModule.AbsoluteLayout> {
	public create(): absoluteLayoutModule.AbsoluteLayout {
		return new absoluteLayoutModule.AbsoluteLayout();
	}

	public test_recycling() {
		helper.nativeView_recycling_test(() => new absoluteLayoutModule.AbsoluteLayout());
	}

	public test_item_recycling() {
		helper.nativeView_recycling_test(
			() => new labelModule.Label(),
			() => new absoluteLayoutModule.AbsoluteLayout()
		);
	}

	public snippet() {
		// >> absolute-layout-populating
		var absoluteLayout = new absoluteLayoutModule.AbsoluteLayout();
		absoluteLayout.width = 230;
		absoluteLayout.height = 230;
		absoluteLayout.style.backgroundColor = new colorModule.Color('LightGray');
		var label = new labelModule.Label();
		// In absolute layout place of an UI element is determined by 4 parameters : left, top, width and height.
		absoluteLayoutModule.AbsoluteLayout.setLeft(label, 10);
		absoluteLayoutModule.AbsoluteLayout.setTop(label, 10);
		label.width = 100;
		label.height = 100;
		label.text = 'LT';
		label.id = 'LT';
		label.style.backgroundColor = new colorModule.Color('Red');
		absoluteLayout.addChild(label);
		// << absolute-layout-populating
	}

	public testAll() {
		let absoluteLayout = this.testView;
		absoluteLayout.width = { value: 230, unit: 'px' };
		absoluteLayout.height = { value: 230, unit: 'px' };
		absoluteLayout.style.backgroundColor = new colorModule.Color('LightGray');
		let label = new labelModule.Label();

		absoluteLayoutModule.AbsoluteLayout.setLeft(label, layoutHelper.dp(10));
		absoluteLayoutModule.AbsoluteLayout.setTop(label, layoutHelper.dp(10));
		label.width = { value: 100, unit: 'px' };
		label.height = { value: 100, unit: 'px' };
		label.text = 'LT';
		label.style.backgroundColor = new colorModule.Color('Red');
		absoluteLayout.addChild(label);

		this.waitUntilTestElementLayoutIsValid();

		let actualValue = label._getCurrentLayoutBounds();
		let width = actualValue.right - actualValue.left;
		let height = actualValue.bottom - actualValue.top;
		TKUnit.assertEqual(actualValue.left, 10, 'ActualLeft');
		TKUnit.assertEqual(actualValue.top, 10, 'ActualTop');
		TKUnit.assertEqual(width, 100, 'ActualWidth');
		TKUnit.assertEqual(height, 100, 'Actualheight');
	}

	public test_padding() {
		let absoluteLayout = this.testView;
		absoluteLayout.width = { value: 200, unit: 'px' };
		absoluteLayout.height = { value: 200, unit: 'px' };
		absoluteLayout.style.paddingLeft = { value: 5, unit: 'px' };
		absoluteLayout.style.paddingTop = { value: 15, unit: 'px' };

		// Left Top
		let btn = new layoutHelper.MyButton();
		btn.width = { value: 100, unit: 'px' };
		btn.height = { value: 100, unit: 'px' };
		absoluteLayoutModule.AbsoluteLayout.setLeft(btn, layoutHelper.dp(20));
		absoluteLayoutModule.AbsoluteLayout.setTop(btn, layoutHelper.dp(20));
		absoluteLayout.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();
		layoutHelper.assertMeasure(btn, 100, 100);
		layoutHelper.assertLayout(btn, 25, 35, 100, 100);
	}

	public test_percent_children_support() {
		let layout = this.testView;
		layout.width = { value: 200, unit: 'px' };
		layout.height = { value: 200, unit: 'px' };

		let btn = new layoutHelper.MyButton();
		(<any>btn).width = '50%';
		(<any>btn).height = '50%';
		btn.margin = '10%';
		layout.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		// AbsoluteLayout measures with 0/UNSPECIFIED so we cannot support percents in it.
		layoutHelper.assertMeasure(btn, 100, 100);
		layoutHelper.assertLayout(btn, 20, 20, btn.getMeasuredWidth(), btn.getMeasuredHeight());

		TKUnit.assertEqual(btn.getMeasuredWidth(), 100, 'Button MeasuredWidth incorrect');
		TKUnit.assertEqual(btn.getMeasuredHeight(), 100, 'Button MeasuredHeight incorrect');
	}

	public test_percent_support_nativeLayoutParams_are_correct() {
		commonTests.percent_support_nativeLayoutParams_are_correct(this);
	}
}

export function createTestCase(): AbsoluteLayoutTest {
	return new AbsoluteLayoutTest();
}
