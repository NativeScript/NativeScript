
import { View } from "tns-core-modules/ui/core/view";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { NavigationEntry } from "tns-core-modules/ui/frame";

import { ItemsViewModel } from "../shared/items-view-model";
import { Item } from "../shared/item";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new ItemsViewModel(new Array<Item>(
        { id: 1, name: "Team One (default transition)", description: "u17", transition: "default" },
        { id: 2, name: "Team Two (default transition)", description: "u21", transition: "default" },
        { id: 3, name: "Team One (no transition)", description: "u17", transition: "none" },
        { id: 4, name: "Team Two (no transition)", description: "u21", transition: "none" },
        { id: 5, name: "Team One (slide transition)", description: "u17", transition: "slide" },
        { id: 6, name: "Team Two (slide transition)", description: "u21", transition: "slide" },
        { id: 7, name: "Team One (flip transition)", description: "u17", transition: "flip" },
        { id: 8, name: "Team Two (flip transition)", description: "u21", transition: "flip" }
    ));
}

export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    const entry: NavigationEntry = {
        moduleName: "teams/team-item-detail/team-item-detail-page",
        context: tappedItem
    };

    switch (tappedItem.transition) {
        case "none":
            entry.animated = false;
            break;
        case "slide":
            entry.transition = {
                name: "slide",
                duration: 300,
                curve: "easeIn"
            };
            break;
        case "flip":
            entry.transition = {
                name: "flip",
                duration: 300,
                curve: "easeIn"
            };
            break;
    }

    page.frame.navigate(entry);
}
