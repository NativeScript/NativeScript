import * as view from "ui/core/view";
import * as pages from "ui/page";

export function applyTap(args) {
    var page = <pages.Page>(<view.View>args.object).page;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function resetTap(args) {
    var page = <pages.Page>(<view.View>args.object).page;
    page.css = "";
}