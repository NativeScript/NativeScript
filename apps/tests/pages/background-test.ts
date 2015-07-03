import observable = require("data/observable");
import pages = require("ui/page");

var vm = new observable.Observable();
// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    vm.set("style", "background-image: url('~/pages/test2.png'); \nborder-color: green; \nborder-radius: 20; \nborder-width: 4;");
    // Get the event sender
    var page = <pages.Page>args.object;
    page.bindingContext = vm;
}

export function applyTap(args){
    args.object.parent.style = vm.get("style");
}