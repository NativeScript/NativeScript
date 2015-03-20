import pages = require("ui/page");
import observable = require("data/observable");
import vmModule = require("./main-view-model");
// Event handler for Page "navigatedTo" event attached in details-page.xml
export function pageNavigatedTo(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = vmModule.mainViewModel.get("selectedItem");
}
