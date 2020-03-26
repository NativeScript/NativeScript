import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";
import { BottomNavigation } from "tns-core-modules/ui/bottom-navigation";

export function onButtonTap(args) {
    const page = <Page>(<View>args.object).page;
    const bottomNavigation = <BottomNavigation>(page.getViewById("bottomNavigation"));

    bottomNavigation.tabStrip.className = "newTabsClass";
}