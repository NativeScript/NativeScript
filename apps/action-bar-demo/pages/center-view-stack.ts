import observable = require("data/observable");
import pages = require("ui/page");

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    var vm = new observable.Observable();
    page.bindingContext = vm;
}