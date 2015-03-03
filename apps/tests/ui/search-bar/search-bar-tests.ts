import observable = require("data/observable");
// <snippet module="ui/search-bar" title="search-bar">
// # SearchBar
// Using the SearchBar requires the "ui/search-bar" module.
// ``` JavaScript
import searchBarModule = require("ui/search-bar");
// ```
// </snippet>

export function test_DummyTestForSnippetOnly() {
    // <snippet module="ui/search-bar" title="search-bar">
    // ### Searching
    // ``` JavaScript
    var searchBar = new searchBarModule.SearchBar();
    searchBar.on(searchBarModule.knownEvents.submit, function (args: observable.EventData) { 
        console.log("Search for " + (<searchBarModule.SearchBar>args.object).text);
    });
    searchBar.on(searchBarModule.knownEvents.clear, function (args: observable.EventData) {
        console.log("Clear");
    });
    // ```
    // </snippet>
}