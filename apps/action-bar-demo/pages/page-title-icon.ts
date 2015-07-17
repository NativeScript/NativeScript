import observable = require("data/observable");
import pages = require("ui/page");
import view = require("ui/core/view");

var i = 0;
export function buttonTap(args: observable.EventData) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")
    page.actionBar.title = "Title changed " + i++;

    if (page.actionBar.android) {
        if (i % 3 === 0) {
            page.actionBar.android.icon = "res://ic_test";
        }
        else if (i % 3 === 1) {
            page.actionBar.android.icon = "~/test-icon.png";
        }
        else if (i % 3 === 2) {
            page.actionBar.android.icon = undefined;
        }
    }
}

var j = 0;
export function visibilityTap(args: observable.EventData) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")

    if (page.actionBar.android) {
        if (j % 3 === 0) {
            page.actionBar.android.iconVisibility = "always";
        }
        else if (j % 3 === 1) {
            page.actionBar.android.iconVisibility = "never";
        }
        else if (j % 3 === 2) {
            page.actionBar.android.iconVisibility = "auto";
        }
        j++;
        console.log("Visibility changed to: " + page.actionBar.android.iconVisibility);
    }
}
