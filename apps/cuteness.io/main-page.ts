import observable = require("data/observable");
import pages = require("ui/page");
import frames = require("ui/frame");
import listView = require("ui/list-view");

import redditAppViewModel = require("./reddit-app-view-model");

var appViewModel = new redditAppViewModel.AppViewModel();

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    var page = <pages.Page>args.object;

    page.bindingContext = appViewModel;

    // Enable platform specific feature (in this case Android page caching)
    if (frames.topmost().android) {
        frames.topmost().android.cachePagesOnNavigate = true;
    }
}

export function listViewItemTap(args: listView.ItemEventData) {
    // Navigate to the details page with context set to the data item for specified index
    frames.topmost().navigate({
        moduleName: "app/details-page",
        context: appViewModel.redditItems.getItem(args.index)
    });
}

export function listViewLoadMoreItems(args: observable.EventData) {
    // Increase model items length with model items loadSize property value
    appViewModel.redditItems.length += appViewModel.redditItems.loadSize;
}
