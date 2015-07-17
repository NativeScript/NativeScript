import observable = require("data/observable");
import view = require("ui/core/view");
import pages = require("ui/page");

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    var vm = new observable.Observable();
    vm.set("title", "title");
    vm.set("navText", "navText");
    vm.set("firstItemText", "txt");
    vm.set("secondItemIcon", "res://ic_test");
    vm.set("mainIcon", "res://ic_test");
    vm.set("navIcon", "res://ic_test");
    vm.set("firstItemTap", function () {
        console.log("firstItemTap");
    });
    vm.set("secondItemTap", function () {
        console.log("secondItemTap");
    });
    vm.set("navTap", function () {
        console.log("navTap");
    });
    page.bindingContext = vm;
}
var i = 0;
export function buttonTap(args) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")
    var vm = page.bindingContext;
    var icon;
    if (i % 3 === 0) {
        icon = "res://ic_test";
    }
    else if (i % 3 === 1) {
        icon = "~/action-bar-demo/test-icon.png";
    }
    else if (i % 3 === 2) {
        icon = undefined;
    }
    vm.set("title", "title " + i);
    vm.set("navText", "navText " + i);
    vm.set("firstItemText", "txt " + i);
    vm.set("secondItemIcon", icon);
    vm.set("mainIcon", icon);
    vm.set("navIcon", icon);
    vm.set("firstItemTap", function () {
        var j = i;
        console.log("firstItemTap " + j);
    });
    vm.set("secondItemTap", function () {
        var j = i;
        console.log("secondItemTap " + j);
    });
    vm.set("navTap", function () {
        var j = i;
        console.log("navTap " + j);
    });
    i++;
}
