import * as vmModule from "./bottom-navigation-view-model";

export function bottomNavigaitonLoaded(args) {
    const bottomNav = args.object.page;
    bottomNav.bindingContext = vmModule.bottomNavigationViewModel;
}