import { View } from "tns-core-modules/ui/core/view";
import { ListView } from "tns-core-modules/ui/list-view";
import { EventData } from "tns-core-modules/data/observable";

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];
}

let scrollToBottom = true;
export function onScroll(args: EventData) {
    let page = (<View>args.object).page;

    let listView = page.getViewById<ListView>("listView");
    listView.scrollToIndex(scrollToBottom ? listView.items.length - 1 : 0);

    scrollToBottom = !scrollToBottom;
}
