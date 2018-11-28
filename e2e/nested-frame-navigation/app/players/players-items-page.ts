
import { View } from "tns-core-modules/ui/core/view";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { NavigationEntry } from "tns-core-modules/ui/frame";

import { ItemsViewModel } from "../shared/items-view-model";
import { Item } from "../shared/item";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new ItemsViewModel(new Array<Item>(
        { id: 1, name: "Player One (default transition)", description: "Goalkeeper", transition: "default" },
        { id: 2, name: "Player Two (default transition)", description: "Defender", transition: "default" },
        { id: 3, name: "Player One (no transition)", description: "Goalkeeper", transition: "none" },
        { id: 4, name: "Player Two (no transition)", description: "Defender", transition: "none" },
        { id: 5, name: "Player One (slide transition)", description: "Goalkeeper", transition: "slide" },
        { id: 6, name: "Player Two (slide transition)", description: "Defender", transition: "slide" },
        { id: 7, name: "Player One (flip transition)", description: "Goalkeeper", transition: "flip" },
        { id: 8, name: "Player Two (flip transition)", description: "Defender", transition: "flip" }
    ));
}

export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    const entry: NavigationEntry = {
        moduleName: "players/player-item-detail/player-item-detail-page",
        context: tappedItem
    };

    switch (tappedItem.transition) {
        case "none":
            entry.animated = false;
            break;
        case "slide":
            entry.transition = {
                name: "slide",
                duration: 380,
                curve: "easeIn"
            };
            break;
        case "flip":
            entry.transition = {
                name: "flip",
                duration: 380,
                curve: "easeIn"
            };
            break;
    }

    page.frame.navigate(entry);
}
