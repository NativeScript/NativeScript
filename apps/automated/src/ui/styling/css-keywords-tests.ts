import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Color, Button, StackLayout } from '@nativescript/core';

export var test_value_after_initial = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	btn.backgroundColor = 'initial';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_initial = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'initial';
	TKUnit.assertEqual(btn.color, undefined, 'color property');
};

export var test_value_after_unset = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	btn.backgroundColor = 'unset';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_unset = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'unset';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};

export var test_value_after_revert = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	btn.backgroundColor = 'revert';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_revert = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'revert';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};

// TODO: Add missing inherit support for non-inherited properties
export var test_value_after_inherit = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	btn.backgroundColor = 'inherit';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_inherit = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'inherit';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};
