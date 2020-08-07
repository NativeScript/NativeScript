import * as colorModule from '@nativescript/core/color';
import * as searchBarModule from '@nativescript/core/ui/search-bar';
import * as utils from '@nativescript/core/utils/utils';

function getTextView(bar: android.widget.SearchView): android.widget.TextView {
	if (bar) {
		const pkgName = bar.getContext().getPackageName();
		var id = bar.getContext().getResources().getIdentifier('search_src_text', 'id', pkgName);
		if (id) {
			return <android.widget.TextView>bar.findViewById(id);
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

export function getNativeTextFieldBackgroundColor(searchBar: searchBarModule.SearchBar): colorModule.Color {
	var textView = getTextView(searchBar.android);

	if (textView) {
		return new colorModule.Color((<android.graphics.drawable.ColorDrawable>textView.getBackground()).getColor());
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
