import colorModule = require("color");
import searchBarModule = require("ui/search-bar");

export function getNativeHintColor(searchBar: searchBarModule.SearchBar): colorModule.Color {
    // TODO: This test needs to be created
    return undefined;
}
export function getNativeFontSize(searchBar: searchBarModule.SearchBar): number {
    var bar = <UISearchBar>searchBar.ios;
    var sf = <UITextField>bar.valueForKey("_searchField");
    if (sf) {
        return sf.font.pointSize;
    }

    return undefined;
}

