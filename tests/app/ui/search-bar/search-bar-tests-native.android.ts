import * as colorModule from "color";
import * as searchBarModule from "ui/search-bar";
import * as utils from "utils/utils";

function getTextView(bar: android.widget.SearchView): android.widget.TextView {
    if (bar) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        if (id) {
            return <android.widget.TextView> bar.findViewById(id);
        }
    }

    return undefined;
}

export function getNativeHintColor(searchBar: searchBarModule.SearchBar): colorModule.Color {
    var textView = getTextView(searchBar.android);

    if (textView) {
        return new colorModule.Color(textView.getHintTextColors().getDefaultColor());
    }
    return undefined;
}

export function getNativeFontSize(searchBar: searchBarModule.SearchBar): number {
    var textView = getTextView(searchBar.android);

    if (textView) {
        return textView.getTextSize() / utils.layout.getDisplayDensity();
    }
    return undefined;
}