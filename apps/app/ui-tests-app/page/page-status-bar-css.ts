import color = require("color");
import page = require("ui/page");
import style = require("ui/styling/style");
import view = require("ui/core/view");

export function applyTap(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    let css = "#test-element { " + args.object.tag + " }";
    page.css = css;
 }

export function applyTapOnStyledActionBar(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    page.actionBar.backgroundColor = new color.Color("#5DFC0A");
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithHiddenActionBar(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    page.actionBarHidden = true;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithSpan(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapOnStyledActionBarAndSpan(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBar.backgroundColor = new color.Color("#E0115F");
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithActionBarHiddenAndSpan(args) {
    let page = <page.Page>(<view.View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

function reset(page: page.Page) {
    page.css = "";
    page.actionBarHidden = false;
    page.backgroundSpanUnderStatusBar = false;
    page.actionBar.style._resetValue(style.backgroundColorProperty);
} 