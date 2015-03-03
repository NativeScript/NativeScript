import observable = require("data/observable");
import pages = require("ui/page");
import frames = require("ui/frame");
import listView = require("ui/list-view");
import vmModule = require("./main-view-model");

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = vmModule.mainViewModel;
}

export function listViewItemTap(args: listView.ItemEventData) {
    // Navigate to the details page with context set to the current data item
    frames.topmost().navigate({
        moduleName: "app/details-page",
        context: args.view.bindingContext
    });
}