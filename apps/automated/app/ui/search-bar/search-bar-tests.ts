import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as viewModule from '@nativescript/core/ui/core/view';
import * as searchBarTestsNative from './search-bar-tests-native';
import * as colorModule from '@nativescript/core/color';
import { EventData } from '@nativescript/core';
// >> article-require-searchbar-module
import * as searchBarModule from '@nativescript/core/ui/search-bar';
// << article-require-searchbar-module

// ### Declaring a SearchBar.
//``` XML
//  <Page>
//      <SearchBar text="{{ search }}" />
//  </Page>
//```
// </snippet>

var _createSearchBarFunc = function (): searchBarModule.SearchBar {
	// >> article-creating-searchbar
	var searchBar = new searchBarModule.SearchBar();
	// << article-creating-searchbar
	searchBar.text = 'searchBar';

	return searchBar;
};

export function test_recycling() {
	helper.nativeView_recycling_test(() => new searchBarModule.SearchBar());
}

export var testSearchBarHintColor = function () {
	helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
		var searchBar = <searchBarModule.SearchBar>views[0];

		searchBar.text = '';
		searchBar.hint = 'hint color test';

		var expectedNormalizedValue;
		var actualValue;

		searchBar.textFieldHintColor = new colorModule.Color('blue');
		expectedNormalizedValue = '#0000FF'; // blue
		actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
		TKUnit.assert(actualValue === expectedNormalizedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedNormalizedValue);

		searchBar.textFieldHintColor = new colorModule.Color('red');
		expectedNormalizedValue = '#FF0000'; // red
		actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
		TKUnit.assert(actualValue === expectedNormalizedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedNormalizedValue);
	});
};

export var testSearchBarTextFieldBackgroundColor = function () {
	helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
		var searchBar = <searchBarModule.SearchBar>views[0];

		searchBar.text = '';
		searchBar.hint = '';

		var expectedNormalizedValue;
		var actualValue;

		searchBar.textFieldBackgroundColor = new colorModule.Color('blue');
		expectedNormalizedValue = '#0000FF'; // blue
		actualValue = searchBarTestsNative.getNativeTextFieldBackgroundColor(searchBar).hex;
		TKUnit.assert(actualValue === expectedNormalizedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedNormalizedValue);

		searchBar.textFieldBackgroundColor = new colorModule.Color('red');
		expectedNormalizedValue = '#FF0000'; // red
		actualValue = searchBarTestsNative.getNativeTextFieldBackgroundColor(searchBar).hex;
		TKUnit.assert(actualValue === expectedNormalizedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedNormalizedValue);
	});
};

export var testSearchBarFontSize = function () {
	helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
		var searchBar = <searchBarModule.SearchBar>views[0];

		searchBar.text = '';
		searchBar.hint = 'hint font-size test';

		var expectedValue = 30;
		var actualValue;

		searchBar.style.fontSize = expectedValue;
		actualValue = searchBarTestsNative.getNativeFontSize(searchBar);
		TKUnit.assertAreClose(actualValue, expectedValue, 0.2);
	});
};

export var testSearchBarPropertiesWithCSS = function () {
	helper.buildUIAndRunTest(
		_createSearchBarFunc(),
		function (views: Array<viewModule.View>) {
			var searchBar = <searchBarModule.SearchBar>views[0];

			searchBar.text = '';
			searchBar.hint = 'hint css test';

			const expectedHintColor = '#0000FF'; // blue
			const expectedTextFieldBackgroundColor = '#FF0000'; // red
			const expectedFontSize = 30;

			const hintColorActualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
			const textFieldBackgroundColorActualValue = searchBarTestsNative.getNativeTextFieldBackgroundColor(searchBar).hex;
			const fontSizeActualValue = searchBarTestsNative.getNativeFontSize(searchBar);

			TKUnit.assert(hintColorActualValue === expectedHintColor, 'HintColor - Actual: ' + hintColorActualValue + '; Expected: ' + expectedHintColor);
			TKUnit.assert(expectedTextFieldBackgroundColor === textFieldBackgroundColorActualValue, 'Text Background Color - Actual: ' + textFieldBackgroundColorActualValue + '; Expected: ' + expectedTextFieldBackgroundColor);
			TKUnit.assertAreClose(expectedFontSize, fontSizeActualValue, 0.2, 'Font Size - Actual: ' + fontSizeActualValue + '; Expected: ' + expectedFontSize);
		},
		{
			pageCss: `
        SearchBar {
            text-field-hint-color: blue;
            text-field-background-color: red;
            font-size: 30;
        }
    `,
		}
	);
};

export function test_DummyTestForSnippetOnly() {
	// >> article-searching
	var searchBar = new searchBarModule.SearchBar();
	searchBar.on(searchBarModule.SearchBar.submitEvent, function (args: EventData) {
		console.log('Search for ' + (<searchBarModule.SearchBar>args.object).text);
	});
	searchBar.on(searchBarModule.SearchBar.clearEvent, function (args: EventData) {
		console.log('Clear');
	});
	// << article-searching
}
