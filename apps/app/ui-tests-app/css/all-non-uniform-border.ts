import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { isAndroid } from "tns-core-modules/platform";

export function onLoaded(args: EventData) {
    var page = <Page>args.object;
    var searchBar = <SearchBar>page.getViewById("sb");
    if (isAndroid) {
        searchBar.android.clearFocus();
    }
}
