import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Tabs } from "tns-core-modules/ui/tabs";

export function goToFirst(args: EventData) {
    const page = <Page>(<any>args.object).page;
    const bottomNav = <Tabs>page.getViewById("tabsNav");

    bottomNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
  const page = <Page>(<any>args.object).page;
  const bottomNav = <Tabs>page.getViewById("tabsNav");

  bottomNav.selectedIndex = 1;
}

export function goToThird(args: EventData) {
  const page = <Page>(<any>args.object).page;
  const bottomNav = <Tabs>page.getViewById("tabsNav");

  bottomNav.selectedIndex = 2;
}
