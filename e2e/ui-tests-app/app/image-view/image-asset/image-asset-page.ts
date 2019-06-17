import * as vmModule from "./view-model";

var viewModel = vmModule.imageViewModel;

export function pageLoaded(args) {
    let page = args.object;
    page.bindingContext = viewModel;
}