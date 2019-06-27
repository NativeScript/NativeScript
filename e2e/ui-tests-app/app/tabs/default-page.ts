import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Tabs } from "tns-core-modules/ui/tabs";

export function goToFirst(args: EventData) {
    const page = <Page>(<any>args.object).page;
    const tabsNav = <Tabs>page.getViewById("tabsNav");

    tabsNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
  const page = <Page>(<any>args.object).page;
  const tabsNav = <Tabs>page.getViewById("tabsNav");

  tabsNav.selectedIndex = 1;
}
