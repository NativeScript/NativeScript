
import { View } from "tns-core-modules/ui/core/view";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemsViewModel } from "../shared/items-view-model";
import { Item } from "../shared/item";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new ItemsViewModel(new Array<Item>(
        { id: 1, name: "Player One", description: "Goalkeeper" },
        { id: 2, name: "Player Two", description: "Defender" }
    ));
}

export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    page.frame.navigate({
        moduleName: "players/player-item-detail/player-item-detail-page",
        context: tappedItem
    });
}