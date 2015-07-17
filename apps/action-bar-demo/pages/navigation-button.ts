import observable = require("data/observable");
import pages = require("ui/page");
import action = require("ui/action-bar");
import view = require("ui/core/view");

var i = 0;
export function buttonTap(args: observable.EventData) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")

    var navBtn = new action.NavigationButton();
    navBtn.text = "nav " + i++;
    if (i % 3 === 0) {
        navBtn.icon = "res://ic_test";
    }
    else if (i % 3 === 1) {
        navBtn.icon = "~/test-icon.png";
    }
    else if (i % 3 === 2) {
        // no icon
    }

    navBtn.on("tap", navTap);

    page.actionBar.navigationButton = navBtn;
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

export function navTap(args: observable.EventData) {
    console.log("navigation button tapped");
}
