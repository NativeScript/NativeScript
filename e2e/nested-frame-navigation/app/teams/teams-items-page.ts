
import { View } from "tns-core-modules/ui/core/view";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemsViewModel } from "../shared/items-view-model";
import { Item } from "../shared/item";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new ItemsViewModel(new Array<Item>(
        { id: 1, name: "Team One", description: "u17" },
        { id: 2, name: "Team Two", description: "u21" }
    ));
}
export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    page.frame.navigate({
        moduleName: "teams/team-item-detail/team-item-detail-page",
        context: tappedItem
    });
}
