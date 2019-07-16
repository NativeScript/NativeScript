import * as vmModule from "./bottom-navigation-view-model";

var viewModel = vmModule.bottomNavigationViewModel;

export function bottomNavigaitonLoaded(args) {
    let bottomNav = args.object;
    bottomNav.bindingContext = viewModel;
}

export function addTabs(args) {
    viewModel.createItems();
}