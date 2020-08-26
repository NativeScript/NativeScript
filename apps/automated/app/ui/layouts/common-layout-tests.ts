import * as TKUnit from '../../tk-unit';
import * as layoutHelper from './layout-helper';
import * as testModule from '../../ui-test';
import { LayoutBase, unsetValue, PercentLength, Device, platformNames } from '@nativescript/core';

function getNativeLayoutParams(nativeView: android.view.View): org.nativescript.widgets.CommonLayoutParams {
	var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
	if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
		lp = new org.nativescript.widgets.CommonLayoutParams();
	}

	return lp;
}

export function percent_support_nativeLayoutParams_are_correct(test: testModule.UITest<LayoutBase>) {
	if (Device.os !== platformNames.android) {
		return;
	}

	let layout = test.testView;
	layout.width = { value: 200, unit: 'px' };
	layout.height = { value: 200, unit: 'px' };

	let btn = new layoutHelper.MyButton();
	btn.width = { value: 100, unit: 'px' };
	btn.height = { value: 100, unit: 'px' };
	btn.margin = '10%';
	layout.addChild(btn);

	test.waitUntilTestElementLayoutIsValid();

	let lp = getNativeLayoutParams(btn.nativeViewProtected);
	TKUnit.assertEqual(lp.width, 100, 'width');
	TKUnit.assertEqual(lp.widthPercent, -1, 'widthPercent');
	TKUnit.assertEqual(lp.height, 100, 'height');
	TKUnit.assertEqual(lp.heightPercent, -1, 'heightPercent');
	TKUnit.assertEqual(lp.topMargin, 0, 'topMargin');
	TKUnit.assertTrue(lp.topMarginPercent > 0, 'topMarginPercent');
	TKUnit.assertEqual(lp.leftMargin, 0, 'leftMargin');
	TKUnit.assertTrue(lp.leftMarginPercent > 0, 'leftMarginPercent');
	TKUnit.assertEqual(lp.rightMargin, 0, 'rightMargin');
	TKUnit.assertTrue(lp.rightMarginPercent > 0, 'rightMarginPercent');
	TKUnit.assertEqual(lp.bottomMargin, 0, 'bottomMargin');
	TKUnit.assertTrue(lp.bottomMarginPercent > 0, 'bottomMarginPercent');

	(<any>btn).width = '50%';
	(<any>btn).height = '50%';
	test.waitUntilTestElementLayoutIsValid();

	TKUnit.assertEqual(lp.width, -1, 'width');
	TKUnit.assertEqual(lp.widthPercent, 0.5, 'widthPercent');
	TKUnit.assertEqual(lp.height, -1, 'height');
	TKUnit.assertEqual(lp.heightPercent, 0.5, 'heightPercent');

	btn.margin = '0';
	btn.height = unsetValue;
	btn.style.width = unsetValue;

	test.waitUntilTestElementLayoutIsValid();

	TKUnit.assertEqual(lp.width, -1, 'width');
	TKUnit.assertEqual(lp.widthPercent, -1, 'widthPercent');
	TKUnit.assertEqual(lp.height, -1, 'height');
	TKUnit.assertEqual(lp.heightPercent, -1, 'heightPercent');
	TKUnit.assertEqual(lp.topMargin, 0, 'topMargin');
	TKUnit.assertEqual(lp.topMarginPercent, -1, 'topMarginPercent');
	TKUnit.assertEqual(lp.leftMargin, 0, 'leftMargin');
	TKUnit.assertEqual(lp.leftMarginPercent, -1, 'leftMarginPercent');
	TKUnit.assertEqual(lp.rightMargin, 0, 'rightMargin');
	TKUnit.assertEqual(lp.rightMarginPercent, -1, 'rightMarginPercent');
	TKUnit.assertEqual(lp.bottomMargin, 0, 'bottomMargin');
	TKUnit.assertEqual(lp.bottomMarginPercent, -1, 'bottomMarginPercent');
}

export function percent_support_children_test(test: testModule.UITest<LayoutBase>) {
	let layout: LayoutBase = test.testView;
	layout.removeChildren();
	layout.width = { value: 200, unit: 'px' };
	layout.height = { value: 200, unit: 'px' };

	let btn = new layoutHelper.MyButton();
	btn.horizontalAlignment = 'left';
	btn.verticalAlignment = 'top';
	(<any>btn).width = '50%';
	(<any>btn).height = '50%';
	btn.margin = '10%';
	btn.text = '1';
	layout.addChild(btn);

	test.waitUntilTestElementLayoutIsValid();

	TKUnit.assertEqual(btn.getMeasuredWidth(), 100, 'Button MeasuredWidth incorrect');
	TKUnit.assertEqual(btn.getMeasuredHeight(), 100, 'Button MeasuredHeight incorrect');

	let bounds = btn._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, 20, 'TopLeft layout LEFT incorrect');
	TKUnit.assertEqual(bounds.top, 20, 'TopLeft layout TOP incorrect');
	TKUnit.assertEqual(bounds.right, 120, 'TopLeft layout RIGHT incorrect');
	TKUnit.assertEqual(bounds.bottom, 120, 'TopLeft layout BOTTOM incorrect');

	btn.horizontalAlignment = 'center';
	btn.verticalAlignment = 'middle';
	test.waitUntilTestElementLayoutIsValid();

	bounds = btn._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, 50, 'Center layout LEFT incorrect');
	TKUnit.assertEqual(bounds.top, 50, 'Center layout TOP incorrect');
	TKUnit.assertEqual(bounds.right, 150, 'Center layout RIGHT incorrect');
	TKUnit.assertEqual(bounds.bottom, 150, 'Center layout BOTTOM incorrect');

	btn.horizontalAlignment = 'stretch';
	btn.verticalAlignment = 'stretch';
	test.waitUntilTestElementLayoutIsValid();

	bounds = btn._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, 50, 'Stretch layout LEFT incorrect');
	TKUnit.assertEqual(bounds.top, 50, 'Stretch layout TOP incorrect');
	TKUnit.assertEqual(bounds.right, 150, 'Stretch layout RIGHT incorrect');
	TKUnit.assertEqual(bounds.bottom, 150, 'Stretch layout BOTTOM incorrect');

	btn.horizontalAlignment = 'right';
	btn.verticalAlignment = 'bottom';
	test.waitUntilTestElementLayoutIsValid();

	bounds = btn._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, 200 - 100 - 20, 'BottomRight layout LEFT incorrect');
	TKUnit.assertEqual(bounds.top, 200 - 100 - 20, 'BottomRight layout TOP incorrect');
	TKUnit.assertEqual(bounds.right, 200 - 20, 'BottomRight layout RIGHT incorrect');
	TKUnit.assertEqual(bounds.bottom, 200 - 20, 'BottomRight layout BOTTOM incorrect');

	//reset values.
	btn.height = unsetValue;
	btn.width = unsetValue;

	btn.margin = '0';
	btn.horizontalAlignment = 'stretch';
	btn.verticalAlignment = 'stretch';
	btn.height = unsetValue;

	TKUnit.assertTrue(PercentLength.equals(btn.marginLeft, 0));
	TKUnit.assertTrue(PercentLength.equals(btn.marginTop, 0));
	TKUnit.assertTrue(PercentLength.equals(btn.marginRight, 0));
	TKUnit.assertTrue(PercentLength.equals(btn.marginBottom, 0));

	TKUnit.assertTrue(PercentLength.equals(btn.width, 'auto'));
	TKUnit.assertTrue(PercentLength.equals(btn.height, 'auto'));

	test.waitUntilTestElementLayoutIsValid();

	bounds = btn._getCurrentLayoutBounds();
	TKUnit.assertEqual(bounds.left, 0, 'Reset Stretch layout LEFT incorrect');
	TKUnit.assertEqual(bounds.top, 0, 'Reset Stretch layout TOP incorrect');
	TKUnit.assertEqual(bounds.right, 200, 'Reset Stretch layout RIGHT incorrect');
	TKUnit.assertEqual(bounds.bottom, 200, 'Reset Stretch layout BOTTOM incorrect');
}
