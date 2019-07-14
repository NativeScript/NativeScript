import * as vmModule from "./tabs-binding-view-model";

var viewModel = vmModule.tabsBindingNavigationViewModel;

export function tabsLoaded(args) {
    let tabs = args.object;
    tabs.bindingContext = viewModel;
}

export function addTabs(args) {
    viewModel.createItems();
}