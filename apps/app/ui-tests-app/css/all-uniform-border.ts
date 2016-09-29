import { EventData} from "data/observable";
import { Page } from "ui/page";
import { SearchBar } from "ui/search-bar";
import { isAndroid } from "platform";

export function onLoaded(args: EventData){
    var page = <Page>args.object;
    var searchBar = <SearchBar>page.getViewById("sb");
    if(isAndroid){
        searchBar.android.clearFocus();
    }
}