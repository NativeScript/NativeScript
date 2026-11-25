import * as helper from '../../ui-helper';
import { Color, Button, StackLayout, unsetValue } from '@nativescript/core';

export const test_value_Inherited_after_unset = function () {
	const page = helper.getCurrentPage();
	page.css = 'StackLayout { color: #FF0000; } .blue { color: #0000FF; }';
	const btn = new Button();
	const testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);
	btn.className = 'blue';
	helper.assertViewColor(btn, '#0000FF');
	btn.className = '';
	helper.assertViewColor(btn, '#FF0000');
};

export const test_value_Inherited_stronger_than_Default = function () {
	const page = helper.getCurrentPage();
	const btn = new Button();
	const testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);
	page.css = 'stackLayout { color: red; }';
	helper.assertViewColor(btn, '#FF0000');
	page.css = '';
};

export const test_value_Css_stronger_than_Inherited = function () {
	const page = helper.getCurrentPage();
	const testStack = new StackLayout();
	page.content = testStack;

	const btn = new Button();
	testStack.addChild(btn);
	page.css = 'stackLayout { color: red; } button { color: blue; }';

	helper.assertViewColor(btn, '#0000FF');
};

export function test_value_Local_stronger_than_Css() {
	const testPage = helper.getCurrentPage();
	const testStack = new StackLayout();
	testPage.content = testStack;

	const btn = new Button();
	testStack.addChild(btn);
	testPage.css = 'button { color: red; }';

	helper.assertViewColor(btn, '#FF0000');
	btn.style.color = new Color('#0000FF');
	helper.assertViewColor(btn, '#0000FF');
	btn.style.color = unsetValue;
	helper.assertViewColor(btn, '#FF0000');
}
