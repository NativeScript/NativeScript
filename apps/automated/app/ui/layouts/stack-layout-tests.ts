import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Button } from '@nativescript/core/ui/button';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as enums from '@nativescript/core/ui/enums';
import * as utils from '@nativescript/core/utils/utils';
import * as testModule from '../../ui-test';
import * as layoutHelper from './layout-helper';
import * as commonTests from './common-layout-tests';

export class StackLayoutTest extends testModule.UITest<StackLayout> {
	private rootLayout: layoutHelper.MyStackLayout;
	private btn1: layoutHelper.MyButton;
	private btn2: layoutHelper.MyButton;

	public create(): StackLayout {
		this.rootLayout = new layoutHelper.MyStackLayout();
		this.btn1 = new layoutHelper.MyButton();
		this.btn1.text = 'btn1';
		this.rootLayout.addChild(this.btn1);
		this.btn2 = new layoutHelper.MyButton();
		this.btn2.text = 'btn2';
		this.rootLayout.addChild(this.btn2);

		return this.rootLayout;
	}

	public test_StackLayout_recycling() {
		helper.nativeView_recycling_test(() => new StackLayout());
	}

	public test_orientation_DefaultValue() {
		TKUnit.assertEqual(this.rootLayout.orientation, enums.Orientation.vertical, 'Default orientation should be Vertical.');
	}

	public test_SetWrongOrientation_ShouldThrowError() {
		TKUnit.assertThrows(() => {
			(<any>this.rootLayout).orientation = 'not_valid';
		}, 'Setting invalid value for orientation should throw exception.');
	}

	public test_Orientation_Change() {
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.rootLayout.orientation, enums.Orientation.vertical, 'Default orientation should be Vertical.');

		this.rootLayout.orientation = 'horizontal';
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.rootLayout.measureCount, 2, 'Orientation change should invalidate measure.');
		TKUnit.assertEqual(this.rootLayout.arrangeCount, 2, 'Orientation change should invalidate arrange.');
	}

	public test_ShouldMeasureWith_AtMost_OnVertical() {
		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.rootLayout.orientation, enums.Orientation.vertical, 'StackLayout should be vertical.');
		TKUnit.assertTrue(this.rootLayout.measured, 'Layout should be measured.');
		TKUnit.assertTrue(this.rootLayout.arranged, 'Layout should be arranged.');

		TKUnit.assertEqual(utils.layout.getMeasureSpecMode(this.btn1.heightMeasureSpec), utils.layout.AT_MOST, 'Layout should measure child with AT_MOST Height in vertical orientation.');
	}

	public test_ShouldMeasureWith_AtMost_OnHorizontal() {
		this.rootLayout.orientation = 'horizontal';

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assert(this.rootLayout.measured, 'Layout should be measured.');
		TKUnit.assert(this.rootLayout.arranged, 'Layout should be arranged.');

		TKUnit.assertEqual(utils.layout.getMeasureSpecMode(this.btn1.widthMeasureSpec), utils.layout.AT_MOST, 'Layout should measure child with AT_MOST Width in horizontal orientation.');
	}

	public test_DesiredSize_Vertical() {
		this.rootLayout.verticalAlignment = 'top';
		this.rootLayout.horizontalAlignment = 'left';

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.rootLayout.getMeasuredWidth(), Math.max(this.btn1.getMeasuredWidth(), this.btn2.getMeasuredWidth()), 'Layout getMeasuredWidth should be Max of children getMeasuredWidth');
		TKUnit.assertEqual(this.rootLayout.getMeasuredHeight(), this.btn1.getMeasuredHeight() + this.btn2.getMeasuredHeight(), 'Layout getMeasuredHeight should be Sum of children getMeasuredHeight');
	}

	public test_DesiredSize_Horizontal() {
		this.rootLayout.horizontalAlignment = 'left';
		this.rootLayout.verticalAlignment = 'top';
		this.rootLayout.orientation = 'horizontal';

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertEqual(this.rootLayout.getMeasuredWidth(), this.btn1.getMeasuredWidth() + this.btn2.getMeasuredWidth(), 'Layout getMeasuredWidth should be Sum of children getMeasuredWidth');
		TKUnit.assertEqual(this.rootLayout.getMeasuredHeight(), Math.max(this.btn1.getMeasuredHeight(), this.btn2.getMeasuredHeight()), 'Layout getMeasuredHeight should be Max of children getMeasuredHeight');
	}

	public test_Padding_Vertical() {
		this.rootLayout.width = { value: 300, unit: 'px' };
		this.rootLayout.height = { value: 300, unit: 'px' };

		this.rootLayout.style.paddingLeft = { value: 10, unit: 'px' };
		this.rootLayout.style.paddingTop = { value: 20, unit: 'px' };
		this.rootLayout.style.paddingRight = { value: 30, unit: 'px' };
		this.rootLayout.style.paddingBottom = { value: 40, unit: 'px' };

		this.btn1.height = { value: 50, unit: 'px' };
		this.btn2.height = { value: 50, unit: 'px' };

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(this.btn1, 260, 50);
		layoutHelper.assertMeasure(this.btn2, 260, 50);

		layoutHelper.assertLayout(this.btn1, 10, 20, 260, 50, 'btn1');
		layoutHelper.assertLayout(this.btn2, 10, 70, 260, 50, 'btn2');
	}

	public test_Padding_Horizontal() {
		this.rootLayout.width = { value: 300, unit: 'px' };
		this.rootLayout.height = { value: 300, unit: 'px' };
		this.rootLayout.orientation = 'horizontal';

		this.rootLayout.style.paddingLeft = { value: 10, unit: 'px' };
		this.rootLayout.style.paddingTop = { value: 20, unit: 'px' };
		this.rootLayout.style.paddingRight = { value: 30, unit: 'px' };
		this.rootLayout.style.paddingBottom = { value: 40, unit: 'px' };

		this.btn1.width = { value: 50, unit: 'px' };
		this.btn2.width = { value: 50, unit: 'px' };

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(this.btn1, 50, 240);
		layoutHelper.assertMeasure(this.btn2, 50, 240);

		layoutHelper.assertLayout(this.btn1, 10, 20, 50, 240, 'btn1');
		layoutHelper.assertLayout(this.btn2, 60, 20, 50, 240, 'btn2');
	}

	private assertChildTexts(expected, layout, message) {
		let texts: Array<string> = [];
		layout.eachChildView((child: { text: string }) => texts.push(child.text));
		TKUnit.assertEqual(expected, texts.join('|'), message);
	}

	public test_insertChildAtPosition() {
		this.assertChildTexts('btn1|btn2', this.rootLayout, 'initial 2 buttons');

		let newChild = new Button();
		newChild.text = 'in-between';
		this.rootLayout.insertChild(newChild, 1);

		this.assertChildTexts('btn1|in-between|btn2', this.rootLayout, 'button inserted at correct location');
	}

	public test_getChildIndex() {
		let lastChildIndex = this.rootLayout.getChildrenCount() - 1;
		let lastButton = <Button>this.rootLayout.getChildAt(lastChildIndex);
		TKUnit.assertEqual('btn2', lastButton.text);
		TKUnit.assertEqual(lastChildIndex, this.rootLayout.getChildIndex(lastButton));

		let nonChild = new Button();
		TKUnit.assertEqual(-1, this.rootLayout.getChildIndex(nonChild));
	}

	public test_codesnippets() {
		// >> stack-layout-require
		// var StackLayout = require("ui/layouts/stack-layout").StackLayout;
		// << stack-layout-require

		// >> stack-layout-new
		// >> (hide)
		// var Button = require("ui/button").Button;
		// << (hide)
		var stackLayout = new StackLayout();
		// << stack-layout-new

		// >> stack-layout-addchild
		var btn = new Button();
		stackLayout.addChild(btn);
		//  << stack-layout-addchild

		// >> stack-layout-remove
		stackLayout.removeChild(btn);
		// << stack-layout-remove

		// >> stack-layout-horizontal
		stackLayout.orientation = 'horizontal';
		// << stack-layout-horizontal
	}

	private setup_percent(): layoutHelper.MyButton {
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

		return btn;
	}

	public test_percent_support_vertical() {
		let btn = this.setup_percent();

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
		TKUnit.assertEqual(bounds.left, 50, 'Center layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'Center layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 150, 'Center layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'Center layout BOTTOM incorrect');

		btn.horizontalAlignment = 'stretch';
		btn.verticalAlignment = 'stretch';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 50, 'Stretch layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'Stretch layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 150, 'Stretch layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'Stretch layout BOTTOM incorrect');

		btn.horizontalAlignment = 'right';
		btn.verticalAlignment = 'bottom';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 80, 'BottomRight layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 20, 'BottomRight layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 180, 'BottomRight layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 120, 'BottomRight layout BOTTOM incorrect');
	}

	public test_percent_support_horizontal() {
		let btn = this.setup_percent();
		this.testView.orientation = 'horizontal';
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
		TKUnit.assertEqual(bounds.top, 50, 'Center layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'Center layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 150, 'Center layout BOTTOM incorrect');

		btn.horizontalAlignment = 'stretch';
		btn.verticalAlignment = 'stretch';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'Stretch layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 50, 'Stretch layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'Stretch layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 150, 'Stretch layout BOTTOM incorrect');

		btn.horizontalAlignment = 'right';
		btn.verticalAlignment = 'bottom';
		this.waitUntilTestElementLayoutIsValid();

		bounds = btn._getCurrentLayoutBounds();
		TKUnit.assertEqual(bounds.left, 20, 'BottomRight layout LEFT incorrect');
		TKUnit.assertEqual(bounds.top, 80, 'BottomRight layout TOP incorrect');
		TKUnit.assertEqual(bounds.right, 120, 'BottomRight layout RIGHT incorrect');
		TKUnit.assertEqual(bounds.bottom, 180, 'BottomRight layout BOTTOM incorrect');
	}

	public test_percent_support_nativeLayoutParams_are_correct() {
		commonTests.percent_support_nativeLayoutParams_are_correct(this);
	}
}

export function createTestCase(): StackLayoutTest {
	return new StackLayoutTest();
}
