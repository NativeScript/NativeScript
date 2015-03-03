import pages = require("ui/page");
import observable = require("data/observable");

// Event handler for Page "navigatedTo" event attached in details-page.xml
export function pageNavigatedTo(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = page.navigationContext;
}
