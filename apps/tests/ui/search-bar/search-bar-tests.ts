import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import searchBarTestsNative = require("./search-bar-tests-native");
import colorModule = require("color");
import observable = require("data/observable");
// <snippet module="ui/search-bar" title="search-bar">
// # SearchBar
// Using the SearchBar requires the "ui/search-bar" module.
// ``` JavaScript
import searchBarModule = require("ui/search-bar");
// ```
// </snippet>

// ### Declaring a SearchBar.
//```XML
//  <Page>
//      <SearchBar text="{{ search }}" />
//  </Page>
//```
// </snippet>

var _createSearchBarFunc = function (): searchBarModule.SearchBar {
    // <snippet module="ui/search-bar" title="SearchBar">
    // ### Creating a SearchBar
    // ``` JavaScript
    var searchBar = new searchBarModule.SearchBar();
    // ```
    // </snippet>
    searchBar.text = "searchBar";
    return searchBar;
};

export var testSearchBarHintColorAndroid = function () {
    helper.buildUIAndRunTest(_createSearchBarFunc(), function (views: Array<viewModule.View>) {
        var searchBar = <searchBarModule.SearchBar>views[0];

        // TODO: create IOS test once IOS support is working
        if (!searchBar.android) {
            return;
        }

        searchBar.text = "";
        searchBar.hint = "hint color test";

        var expectedValue;
        var actualValue;

        searchBar.textFieldHintColor = new colorModule.Color("blue");
        expectedValue = "#ff0000ff"; // blue
        actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);

        searchBar.textFieldHintColor = new colorModule.Color("red");
        expectedValue = "#ffff0000"; // Red
        actualValue = searchBarTestsNative.getNativeHintColor(searchBar).hex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
};

export function test_DummyTestForSnippetOnly() {
    // <snippet module="ui/search-bar" title="search-bar">
    // ### Searching
    // ``` JavaScript
    var searchBar = new searchBarModule.SearchBar();
    searchBar.on(searchBarModule.SearchBar.submitEvent, function (args: observable.EventData) { 
        console.log("Search for " + (<searchBarModule.SearchBar>args.object).text);
    });
    searchBar.on(searchBarModule.SearchBar.clearEvent, function (args: observable.EventData) {
        console.log("Clear");
    });
    // ```
    // </snippet>
}