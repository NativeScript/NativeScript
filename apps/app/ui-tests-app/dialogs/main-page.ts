import * as pages from "tns-core-modules/ui/page";
import * as observable from "tns-core-modules/data/observable";
import * as vmModule from "./view-model";

var viewModel = vmModule.settingsViewModel;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = viewModel;
}
