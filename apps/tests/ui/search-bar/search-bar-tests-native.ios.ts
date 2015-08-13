import colorModule = require("color");
import searchBarModule = require("ui/search-bar");

export function getNativeHintColor(searchBar: searchBarModule.SearchBar): colorModule.Color {
    // TODO: This test needs to be created
    return undefined;
}
export function getNativeFontSize(searchBar: searchBarModule.SearchBar): number {
    var sf = <UITextField>(<any>searchBar)._textField;
    if (sf) {
        return sf.font.pointSize;
    }

    return undefined;
}

