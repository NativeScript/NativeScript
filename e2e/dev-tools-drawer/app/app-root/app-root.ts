import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { topmost } from "tns-core-modules/ui/frame";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";

import { AppRootViewModel } from "./app-root-view-model";

export function onLoaded(args: EventData): void {
    const drawerComponent = <RadSideDrawer>args.object;
    drawerComponent.bindingContext = new AppRootViewModel();
}

export function onNavigationItemTap(args: EventData): void {
    const component = <GridLayout>args.object;
    const componentRoute = component.get("route");
    const componentTitle = component.get("title");
    const bindingContext = <AppRootViewModel>component.bindingContext;

    bindingContext.selectedPage = componentTitle;

    topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: "fade"
        }
    });

    const drawerComponent = <RadSideDrawer>app.getRootView();
    drawerComponent.closeDrawer();
}
