import { View } from "tns-core-modules/ui/core/view";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { HomeViewModel } from "./home-view-model";
import { Item } from "./shared/item";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new HomeViewModel();
}

export function onItemTap(args: ItemEventData) {
    const view = <View>args.view;
    const page = <Page>view.page;
    const tappedItem = <Item>view.bindingContext;

    page.frame.navigate({
        moduleName: "home/home-item-detail/home-item-detail-page",
        context: tappedItem,
        animated: true,
        transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
        }
    });
}
