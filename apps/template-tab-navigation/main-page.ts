import observable = require("data/observable");
import pages = require("ui/page");

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;

    // TODO: Initialize binding context.
    var emptyContext = new observable.Observable();
    page.bindingContext = emptyContext;
}
