import { EventData, Page } from "tns-core-modules/ui/page/page";
import { BottomNavigation } from "tns-core-modules/ui/bottom-navigation/bottom-navigation";

export const selectTab = (args: EventData) => {
    const page = <Page>(<any>args.object).page;
    const bottomNav = <BottomNavigation>page.getViewById("bottomNavigation");

    const index = (<any>args.object).tag;
    bottomNav.selectedIndex = index;
};
