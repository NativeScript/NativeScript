import { Issue5039ViewModel } from './issue-5039-view-model'
import { SearchBar } from "tns-core-modules/ui/search-bar";
import { Page } from "tns-core-modules/ui/page";
 
export function navigatingTo(args) {
    const page = <Page>args.object;
    const searchBar = <SearchBar>page.getViewById("searchBar")
    page.bindingContext = new Issue5039ViewModel(searchBar);
}