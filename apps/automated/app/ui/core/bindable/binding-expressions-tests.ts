import { Frame } from '@nativescript/core/ui/frame';
import * as textFieldModule from '@nativescript/core/ui/text-field';
import * as helper from '../../../ui-helper';

export var test_BindingExpressions_ArrayAccess = function () {
	navigateToPage('bindingExpressions_arrayAccess_testPage');
	assertElementString('textField1', 'bindings');
	assertElementString('textField2', '1');
};

export var test_BindingExpressions_LogicalOperators = function () {
	navigateToPage('bindingExpressions_logicalOperators_testPage');
	assertElementString('textField1', 'true');
	assertElementString('textField2', 'false');
	assertElementString('textField3', 'true');
};

export var test_BindingExpressions_UnaryOperators = function () {
	navigateToPage('bindingExpressions_unaryOperators_testPage');
	assertElementString('textField1', '5');
	assertElementString('textField2', '-5');
	assertElementString('textField3', '3');
	assertElementString('textField4', '-3');
	assertElementString('textField5', '1');
	assertElementString('textField6', '-1');
	assertElementValueIsNaN('textField7');
	assertElementValueIsNaN('textField8');
};

export var test_BindingExpressions_BinaryOperators = function () {
	navigateToPage('bindingExpressions_binaryOperators_testPage');
	assertElementString('textField1', '1');
	assertElementString('textField2', '-1');
	assertElementString('textField3', '0');
	assertElementString('textField4', '0');
	assertElementString('textField5', 'Infinity');
	assertElementString('textField6', '0');
	assertElementValueIsNaN('textField7');
};

export var test_BindingExpressions_ComparisonOperators = function () {
	navigateToPage('bindingExpressions_comparisonOperators_testPage');
	assertElementString('textField1', 'true');
	//assertElementString("textField2", "false");
	assertElementString('textField3', 'true');
	//assertElementString("textField4", "false");
	assertElementString('textField5', 'false');
	assertElementString('textField6', 'true');
	assertElementString('textField7', 'false');
	assertElementString('textField8', 'true');
};

export var test_BindingExpressions_LogicalComparisonOperators = function () {
	navigateToPage('bindingExpressions_logicalComparisonOperators_testPage');
	assertElementString('textField1', 'false');
	assertElementString('textField2', 'true');
	assertElementString('textField3', 'Text');
};

export var test_BindingExpressions_TernaryOperator = function () {
	navigateToPage('bindingExpressions_ternaryOperator_testPage');
	assertElementString('textField1', 'by Pratchett');
};

export var test_BindingExpressions_GroupingParenthesis = function () {
	navigateToPage('bindingExpressions_groupingParenthesis_testPage');
	assertElementString('textField1', '21');
	assertElementString('textField2', '8');
};

export var assertElementString = function (elementId: string, value: any) {
	var element: textFieldModule.TextField = <textFieldModule.TextField>Frame.topmost().currentPage.getViewById(elementId);
	if (element.text.toString() !== value) {
		throw new Error(' Actual: ' + element.text.toString() + ' Expected: ' + value);
	}
};

export var assertElementValueIsNaN = function (elementId: string) {
	var element: textFieldModule.TextField = <textFieldModule.TextField>Frame.topmost().currentPage.getViewById(elementId);
	var value: any = element.text;
	if (isNaN(value) !== true) {
		throw new Error(' Actual: ' + value + ' is not NaN');
	}
};

export var navigateToPage = function (pageName: string) {
	helper.navigateToModule('ui/test-pages/' + pageName);
};
