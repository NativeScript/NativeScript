import observable = require("data/observable");
import pages = require("ui/page");
import vmModule = require("./view-model");

var viewModel = vmModule.settingsViewModel;
// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // The page has loaded.
    var page = <pages.Page>args.object;
    page.bindingContext = viewModel;
}