import * as TKUnit from '../../tk-unit';
import { Label } from '@nativescript/core/ui/label';
import * as layoutHelper from './layout-helper';
import * as testModule from '../../ui-test';
import * as commonTests from './common-layout-tests';
import * as helper from '../../ui-helper';

// >> wrap-layout-require
import * as wrapLayoutModule from '@nativescript/core/ui/layouts/wrap-layout';
// << wrap-layout-require

export class WrapLayoutTest extends testModule.UITest<wrapLayoutModule.WrapLayout> {
	public create(): wrapLayoutModule.WrapLayout {
		// >> wrap-layout-new
		var wrapLayout = new wrapLayoutModule.WrapLayout();
		// << wrap-layout-new

		wrapLayout.width = { value: 200, unit: 'px' };
		wrapLayout.height = { value: 200, unit: 'px' };

		for (let i = 0; i < 2; i++) {
			let label = new Label();
			label.text = '' + i;

			label.width = { value: 100, unit: 'px' };
			label.height = { value: 100, unit: 'px' };
			wrapLayout.addChild(label);
		}

		return wrapLayout;
	}

	public test_StackLayout_recycling() {
		helper.nativeView_recycling_test(() => new wrapLayoutModule.WrapLayout());
	}

	public testItemWidhtItemHeight() {
		let wrap = this.testView;
		wrap.removeChildren();

		wrap.itemWidth = { value: 40, unit: 'px' };
		wrap.itemHeight = { value: 40, unit: 'px' };

		let lbl1 = new layoutHelper.MyButton();
		lbl1.text = '1';
		wrap.addChild(lbl1);

		let lbl2 = new layoutHelper.MyButton();
		lbl2.text = '2';
		lbl2.width = { value: 80, unit: 'px' };
		lbl2.height = { value: 80, unit: 'px' };
		wrap.addChild(lbl2);

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(lbl1.measureWidth, 40, 'lbl1.measureWidth');
		TKUnit.assertEqual(lbl1.measureHeight, 40, 'lbl1.measureHeight');
		TKUnit.assertEqual(lbl1.layoutWidth, 40, 'lbl1.layoutWidth');
		TKUnit.assertEqual(lbl1.layoutHeight, 40, 'lbl1.layoutHeight');

		TKUnit.assertEqual(lbl2.measureWidth, 40, 'lbl2.measureWidth');
		TKUnit.assertEqual(lbl2.measureHeight, 40, 'lbl2.measureHeight');
		TKUnit.assertEqual(lbl2.layoutWidth, 40, 'lbl2.layoutWidth');
		TKUnit.assertEqual(lbl2.layoutHeight, 40, 'lbl2.layoutHeight');
	}

	public testPaddingReduceAvailableSize() {
		let wrap = this.testView;
		wrap.removeChildren();
		wrap.style.paddingLeft = wrap.style.paddingTop = wrap.style.paddingRight = wrap.style.paddingBottom = { value: 10, unit: 'px' };

		let lbl1 = new layoutHelper.MyButton();
		lbl1.text = '1';
		lbl1.minWidth = { value: 200, unit: 'px' };
		lbl1.minHeight = { value: 200, unit: 'px' };
		wrap.addChild(lbl1);

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(lbl1.measureWidth, 180, 'lbl1.measureWidth');
		TKUnit.assertEqual(lbl1.measureHeight, 180, 'lbl1.measureHeight');
		TKUnit.assertEqual(lbl1.layoutWidth, 180, 'lbl1.layoutWidth');
		TKUnit.assertEqual(lbl1.layoutHeight, 180, 'lbl1.layoutHeight');
	}

	public testHorizontalOrientation() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 0, 'ActualLeft on Index 0');
		TKUnit.assertEqual(actualValue.top, 0, 'ActualTop on Index 0');
		TKUnit.assertEqual(actualValue.right, 100, 'ActualRight on Index 0');
		TKUnit.assertEqual(actualValue.bottom, 100, 'ActualBottom on Index 0');

		actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 100, 'ActualLeft on Index 1');
		TKUnit.assertEqual(actualValue.top, 0, 'ActualTop on Index 1');
		TKUnit.assertEqual(actualValue.right, 200, 'ActualRight on Index 1');
		TKUnit.assertEqual(actualValue.bottom, 100, 'ActualBottom on Index 1');
	}

	public testVerticalOrientation() {
		var wrapLayout = this.testView;
		// >> wrap-layout-orientation
		wrapLayout.orientation = 'vertical';
		// << wrap-layout-orientation
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 0, 'ActualLeft on Index 0');
		TKUnit.assertEqual(actualValue.top, 0, 'ActualTop on Index 0');
		TKUnit.assertEqual(actualValue.right, 100, 'ActualRight on Index 0');
		TKUnit.assertEqual(actualValue.bottom, 100, 'ActualBottom on Index 0');

		actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 0, 'ActualLeft on Index 1');
		TKUnit.assertEqual(actualValue.top, 100, 'ActualTop on Index 1');
		TKUnit.assertEqual(actualValue.right, 100, 'ActualRight on Index 1');
		TKUnit.assertEqual(actualValue.bottom, 200, 'ActualBottom on Index 1');
	}

	public testChangeOrientation() {
		this.testView.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();
		this.testView.orientation = 'vertical';
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 0, 'ActualLeft on Index 0');
		TKUnit.assertEqual(actualValue.top, 0, 'ActualTop on Index 0');
		TKUnit.assertEqual(actualValue.right, 100, 'ActualRight on Index 0');
		TKUnit.assertEqual(actualValue.bottom, 100, 'ActualBottom on Index 0');

		actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
		TKUnit.assertEqual(actualValue.left, 0, 'ActualLeft on Index 1');
		TKUnit.assertEqual(actualValue.top, 100, 'ActualTop on Index 1');
		TKUnit.assertEqual(actualValue.right, 100, 'ActualRight on Index 1');
		TKUnit.assertEqual(actualValue.bottom, 200, 'ActualBottom on Index 1');
	}

	public testItemWidth() {
		this.testView.itemWidth = { value: 50, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().left;
		TKUnit.assertEqual(actualValue, 50, 'ActualLeft on Index 1');
	}

	public testChangeItemWidth() {
		this.waitUntilTestElementLayoutIsValid();
		this.testView.itemWidth = { value: 50, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().left;
		TKUnit.assertEqual(actualValue, 50, 'ActualLeft on Index 1');
	}

	public testItemWidthLargerThanTheAvailableWidth() {
		this.testView.itemWidth = { value: 1000, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.getChildAt(0)._getCurrentLayoutBounds().top, 0, 'ActualTop on Index 0');
		TKUnit.assertEqual(this.testView.getChildAt(1)._getCurrentLayoutBounds().top, 100, 'ActualTop on Index 1');
	}

	public testItemHeight() {
		this.testView.itemHeight = { value: 50, unit: 'px' };
		this.testView.orientation = 'vertical';
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().top;
		TKUnit.assertEqual(actualValue, 50, 'ActualTop on Index 1');
	}

	public testChangeItemHeight() {
		this.testView.orientation = 'vertical';
		this.waitUntilTestElementLayoutIsValid();
		this.testView.itemHeight = { value: 50, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().top;
		TKUnit.assertEqual(actualValue, 50, 'ActualTop on Index 1');
	}

	public testItemHeightLargerThanTheAvailableHeight() {
		this.testView.orientation = 'vertical';
		this.waitUntilTestElementLayoutIsValid();
		this.testView.itemHeight = { value: 1000, unit: 'px' };
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.testView.getChildAt(0)._getCurrentLayoutBounds().left, 0, 'ActualLeft on Index 0');
		TKUnit.assertEqual(this.testView.getChildAt(1)._getCurrentLayoutBounds().left, 100, 'ActualLeft on Index 1');
	}

	public testPaddingLeftAndTop() {
		this.testView.removeChildren();
		this.testView.style.paddingLeft = { value: 20, unit: 'px' };
		this.testView.style.paddingTop = { value: 30, unit: 'px' };

		var btn = new layoutHelper.MyButton();
		btn.width = { value: 50, unit: 'px' };
		btn.height = { value: 50, unit: 'px' };
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertLayout(btn, 20, 30, 50, 50);
	}

	public testPaddingRight() {
		this.testView.removeChildren();
		this.testView.style.paddingRight = { value: 30, unit: 'px' };
		this.testView.width = { value: 200, unit: 'px' };

		var btn1 = new layoutHelper.MyButton();
		this.testView.addChild(btn1);
		btn1.width = { value: 100, unit: 'px' };
		btn1.height = { value: 50, unit: 'px' };

		var btn2 = new layoutHelper.MyButton();
		btn2.width = { value: 80, unit: 'px' };
		btn2.height = { value: 50, unit: 'px' };
		this.testView.addChild(btn2);

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(btn1, 100, 50);
		layoutHelper.assertMeasure(btn2, 80, 50);

		// There should be no space left for the button on the first row,
		// because for the padding (200 - 100 - 30) = 70 button wants 80
		layoutHelper.assertLayout(btn1, 0, 0, 100, 50, 'button1');
		layoutHelper.assertLayout(btn2, 0, 50, 80, 50, 'button2');
	}

	public testPaddingBottom() {
		this.testView.removeChildren();
		this.testView.style.paddingBottom = { value: 30, unit: 'px' };
		this.testView.height = { value: 200, unit: 'px' };
		this.testView.orientation = 'vertical';

		var btn1 = new layoutHelper.MyButton();
		this.testView.addChild(btn1);
		btn1.width = { value: 50, unit: 'px' };
		btn1.height = { value: 100, unit: 'px' };

		var btn2 = new layoutHelper.MyButton();
		btn2.width = { value: 50, unit: 'px' };
		btn2.height = { value: 80, unit: 'px' };
		this.testView.addChild(btn2);

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(btn1, 50, 100);
		layoutHelper.assertMeasure(btn2, 50, 80);

		// There should be no space left for the button on the first row,
		// because of the padding (200 - 100 - 30) = 70 button wants 80
		layoutHelper.assertLayout(btn1, 0, 0, 50, 100, 'button1');
		layoutHelper.assertLayout(btn2, 50, 0, 50, 80, 'button2');
	}

	public test_percent_children_support() {
		let layout = this.testView;
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

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(btn.getMeasuredWidth(), 100, 'Button MeasuredWidth incorrect');
		TKUnit.assertEqual(btn.getMeasuredHeight(), 100, 'Button MeasuredHeight incorrect');

		let bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'TopLeft layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'TopLeft layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'TopLeft layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'TopLeft layout BOTTOM incorrect');

		btn.horizontalAlignment = 'center';
		btn.verticalAlignment = 'middle';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'Center layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'Center layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'Center layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'Center layout BOTTOM incorrect');

		btn.horizontalAlignment = 'stretch';
		btn.verticalAlignment = 'stretch';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'Stretch layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'Stretch layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'Stretch layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'Stretch layout BOTTOM incorrect');

		btn.horizontalAlignment = 'right';
		btn.verticalAlignment = 'bottom';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'BottomRight layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'BottomRight layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'BottomRight layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'BottomRight layout BOTTOM incorrect');
	}

	public test_percent_support_nativeLayoutParams_are_correct() {
		commonTests.percent_support_nativeLayoutParams_are_correct(this);
	}
}

export function createTestCase(): WrapLayoutTest {
	return new WrapLayoutTest();
}
