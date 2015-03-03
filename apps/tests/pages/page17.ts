import observable = require("data/observable");
import pages = require("ui/page");

// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    var page = <pages.Page>args.object;

    var textItem = new pages.MenuItem();
    textItem.text = "from loaded";
    textItem.on("tap", () => {
        console.log("item added in page.loaded tapped!!!");
    });
    page.optionsMenu.addItem(textItem);
}

export function optionTap(args) {
    console.log("item added form XML tapped!!!");
}

