import observable = require("data/observable");
import pages = require("ui/page");
import vmModule = require("./main-view-model");

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    var page = <pages.Page>args.object;
    page.bindingContext = vmModule.mainViewModel;
}