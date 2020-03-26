import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";
import { Tabs } from "tns-core-modules/ui/tabs";

export function onButtonTap(args) {
    const page = <Page>(<View>args.object).page;
    const bottomNavigation = <Tabs>(page.getViewById("bottomNavigation"));

    bottomNavigation.tabStrip.className = "newTabsClass";
}