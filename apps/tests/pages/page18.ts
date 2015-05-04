import observable = require("data/observable");
import pages = require("ui/page");
import frame = require("ui/frame");
import trace = require("trace");
trace.setCategories("gestures");
trace.enable();



// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    //// Get the event sender
    //var page = <pages.Page>args.object;

    //var textItem = new pages.MenuItem();
    //textItem.text = "from loaded";
    //textItem.on("tap", () => {
    //    console.log("item added in page.loaded tapped!!!");
    //});
    //page.optionsMenu.addItem(textItem);
}

export function itemTap(args) {
    console.log("----- Item tapped: " + args.view.tag);

    frame.topmost().navigate({
        moduleName: "./pages/page5",
    });
}


export function itemLoaded(args: observable.EventData) {
    console.log("----- Item loaded: " + (<any>args.object).tag);
}

export function itemUnloaded(args: observable.EventData) {
    console.log("----- Item unloaded: " + (<any>args.object).tag);
}