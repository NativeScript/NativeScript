import * as TKUnit from "../../TKUnit";
import * as helper from "../helper";
import * as viewModule from "tns-core-modules/ui/core/view";
import * as searchBarTestsNative from "./search-bar-tests-native";
import * as colorModule from "tns-core-modules/color";
import * as observable from "tns-core-modules/data/observable";
// >> article-require-searchbar-module
import * as searchBarModule from "tns-core-modules/ui/search-bar";
// << article-require-searchbar-module

// ### Declaring a SearchBar.
//``` XML
//  <Page>
//      <SearchBar text="{{ search }}" />
//  </Page>
//```
// </snippet>

var _createSearchBarFunc = function (): searchBarModule.SearchBar {
    // >> article-creating-searchbar
    var searchBar = new searchBarModule.SearchBar();
    // << article-creating-searchbar
    searchBar.text = "searchBar";
    return searchBar;
};

export function test_recycling() {
    helper.nativeView_recycling_test(() => new searchBarModule.SearchBar());
}

export var testSearchBarHintColorAndroid = function () {
    helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
        var searchBar = <searchBarModule.SearchBar>views[0];

        searchBar.text = "";
        searchBar.hint = "hint color test";

        var expectedNormalizedValue;
        var actualValue;

        searchBar.textFieldHintColor = new colorModule.Color("blue");
        expectedNormalizedValue = "#0000FF"; // blue
        actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
        TKUnit.assert(actualValue === expectedNormalizedValue, "Actual: " + actualValue + "; Expected: " + expectedNormalizedValue);

        searchBar.textFieldHintColor = new colorModule.Color("red");
        expectedNormalizedValue = "#FF0000"; // red
        actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
        TKUnit.assert(actualValue === expectedNormalizedValue, "Actual: " + actualValue + "; Expected: " + expectedNormalizedValue);
    });
};

export var testSearchBarFontSize = function () {
    helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
        var searchBar = <searchBarModule.SearchBar>views[0];

        searchBar.text = "";
        searchBar.hint = "hint font-size test";

        var expectedValue = 30;
        var actualValue;

        searchBar.style.fontSize = expectedValue;
        actualValue = searchBarTestsNative.getNativeFontSize(searchBar);
        TKUnit.assertAreClose(actualValue, expectedValue, 0.2);
    });
};

export function test_DummyTestForSnippetOnly() {
    // >> article-searching
    var searchBar = new searchBarModule.SearchBar();
    searchBar.on(searchBarModule.SearchBar.submitEvent, function (args: observable.EventData) { 
        console.log("Search for " + (<searchBarModule.SearchBar>args.object).text);
    });
    searchBar.on(searchBarModule.SearchBar.clearEvent, function (args: observable.EventData) {
        console.log("Clear");
    });
    // << article-searching
}
