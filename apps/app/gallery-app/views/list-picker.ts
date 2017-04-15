import * as pages from "tns-core-modules/ui/page";
import * as observableModule from "tns-core-modules/data/observable";

export function onPageLoaded(args: observableModule.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = {
        items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
        selectedIndex: 2
    };
}
