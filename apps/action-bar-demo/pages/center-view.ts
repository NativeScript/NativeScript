import observable = require("data/observable");
import pages = require("ui/page");

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    var vm = new observable.Observable();
    vm.set("centerText", "center text");
    vm.set("centerTap", function () {
        console.log("Center view tapped!");
    });
    page.bindingContext = vm;
}