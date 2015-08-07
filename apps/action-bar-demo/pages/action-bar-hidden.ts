import pages = require("ui/page");
import view = require("ui/core/view");

var toggle = false;
export function toggleTap(args) {
    var page = <pages.Page>(<view.View>args.object).page;
    page.actionBarHidden = toggle;
    toggle = !toggle;
}
