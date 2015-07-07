import view = require("ui/core/view");
import pages = require("ui/page");

export function applyTap(args) {
    var page = <pages.Page>view.getAncestor(args.object, "Page");
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function resetTap(args) {
    var page = <pages.Page>view.getAncestor(args.object, "Page");
    page.css = "";
}