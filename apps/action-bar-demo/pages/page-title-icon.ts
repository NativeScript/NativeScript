import observable = require("data/observable");
import pages = require("ui/page");
import view = require("ui/core/view");

var i = 0;
export function buttonTap(args: observable.EventData) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")

    page.actionBar.title = "Title changed " + i++;
    if (i % 3 === 0) {
        page.actionBar.icon = "res://ic_test";
    }
    else if (i % 3 === 1) {
        page.actionBar.icon = "~/test-icon.png";
    }
    else if (i % 3 === 2) {
        page.actionBar.icon = undefined;
    }
}

