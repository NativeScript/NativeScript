import { Color } from "color";
import { Page } from "ui/page";
import { View, unsetValue } from "ui/core/view";

export function applyTap(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    let css = "#test-element { " + args.object.tag + " }";
    page.css = css;
 }

export function applyTapOnStyledActionBar(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.actionBar.backgroundColor = new Color("#5DFC0A");
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithHiddenActionBar(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.actionBarHidden = true;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapOnStyledActionBarAndSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBar.backgroundColor = new Color("#E0115F");
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

export function applyTapWithActionBarHiddenAndSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;
    var css = "#test-element { " + args.object.tag + " }";
    page.css = css;
}

function reset(page: Page) {
    page.css = "";
    page.actionBarHidden = false;
    page.backgroundSpanUnderStatusBar = false;
    page.actionBar.style.backgroundColor = unsetValue;
} 