import {EventData as ObservableEventData} from "data/observable";
import {Page} from "ui/page";
import {ItemEventData as ListViewItemEventData} from "ui/list-view";
import {topmost as topmostFrame} from "ui/frame";
import {AppViewModel} from "./reddit-app-view-model";

var appViewModel = new AppViewModel();

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: ObservableEventData) {
    // Get the event sender
    var page = <Page>args.object;

    page.bindingContext = appViewModel;

    // Enable platform specific feature (in this case Android page caching)
    if (topmostFrame().android) {
        topmostFrame().android.cachePagesOnNavigate = true;
    }
}

export function listViewItemTap(args: ListViewItemEventData) {
    // Navigate to the details page with context set to the data item for specified index
    topmostFrame().navigate({
        moduleName: "cuteness.io/details-page",
        context: appViewModel.redditItems.getItem(args.index)
    });
}

export function listViewLoadMoreItems(args: ObservableEventData) {
    // Increase model items length with model items loadSize property value
    appViewModel.redditItems.length += appViewModel.redditItems.loadSize;
}
