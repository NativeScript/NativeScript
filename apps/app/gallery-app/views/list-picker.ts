import * as pages from "ui/page";
import * as observableModule from "data/observable";

export function onPageLoaded(args: observableModule.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = {
        items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
        selectedIndex: 2
    };
}