import { EventData } from "tns-core-modules/data/observable";
import { SubMainPageViewModel } from "../sub-main-page-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";
import { BottomNavigation } from "tns-core-modules/ui/bottom-navigation";

export function goToFirst(args: EventData) {
    const page = <Page>(<any>args.object).page;
    const bottomNav = <BottomNavigation>page.getViewById("bottomNav");

    bottomNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
  const page = <Page>(<any>args.object).page;
  const bottomNav = <BottomNavigation>page.getViewById("bottomNav");

  bottomNav.selectedIndex = 1;
}
