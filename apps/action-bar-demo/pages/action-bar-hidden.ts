import pages = require("ui/page");
import view = require("ui/core/view");

var toggle = false;
export function toggleTap(args) {
    var page = <pages.Page>view.getAncestor(<view.View>args.object, "Page")
    page.actionBarHidden = toggle;
    toggle = !toggle;
}