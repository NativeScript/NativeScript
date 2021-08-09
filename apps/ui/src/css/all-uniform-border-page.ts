import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { SearchBar } from '@nativescript/core/ui/search-bar';
import { isAndroid } from '@nativescript/core/platform';

export function onLoaded(args: EventData) {
	var page = <Page>args.object;
	var searchBar = <SearchBar>page.getViewById('sb');
	if (isAndroid) {
		searchBar.android.clearFocus();
	}
}
