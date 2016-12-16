import * as pages from "ui/page";
import * as observable from "data/observable";
import * as vmModule from "./view-model";

var viewModel = vmModule.settingsViewModel;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = viewModel;
}