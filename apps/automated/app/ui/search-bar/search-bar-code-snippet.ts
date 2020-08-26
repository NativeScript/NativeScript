import { EventData } from '@nativescript/core/data/observable';
import { SearchBar } from '@nativescript/core/ui/search-bar';

export function navigatingTo(args: EventData) {
	console.log('page navigating to');
}
// >> searchbar-clear
export function onClear(args) {
	console.log('clear search-bar text');
}
// << searchbar-clear
// >> searchbar-submit
export function onSubmit(args) {
	var searchbar: SearchBar = <SearchBar>args.object;
	console.log('Search submit result: ' + searchbar.text);
}
// << searchbar-submit
