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