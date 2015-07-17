import pages = require("ui/page");
import observable = require("data/observable");
import vmModule = require("./view-model");

var viewModel = vmModule.settingsViewModel;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = viewModel;
}