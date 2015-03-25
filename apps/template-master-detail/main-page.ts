import observable = require("data/observable");
import pages = require("ui/page");
import frames = require("ui/frame");
import platform = require("platform");
import listView = require("ui/list-view");
import vmModule = require("./main-view-model");

var twoPaneLayout = Math.min(platform.screen.mainScreen.widthDIPs, platform.screen.mainScreen.heightDIPs) > 600;

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = vmModule.mainViewModel;
}

export function listViewItemTap(args: listView.ItemEventData) {
    // Navigate to the details page with context set to the current data item
    if (!twoPaneLayout) {
        frames.topmost().navigate("details-page");
    }

    vmModule.mainViewModel.set("selectedItem", args.view.bindingContext);
}
