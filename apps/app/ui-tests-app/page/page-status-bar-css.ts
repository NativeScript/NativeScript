import { Color } from "tns-core-modules/color";
import { Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { unsetValue } from "tns-core-modules/ui/core/properties";

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
    page.css = "#test-element { " + args.object.tag + " }";
}

export function applyTapWithHiddenActionBar(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.actionBarHidden = true;
    page.css = "#test-element { " + args.object.tag + " }";
}

export function applyTapWithSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.css = "#test-element { " + args.object.tag + " }";
}

export function applyTapOnStyledActionBarAndSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBar.backgroundColor = new Color("#E0115F");
    page.css = "#test-element { " + args.object.tag + " }";
}

export function applyTapWithActionBarHiddenAndSpan(args) {
    let page = <Page>(<View>args.object).page;

    reset(page);

    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;
    page.css = "#test-element { " + args.object.tag + " }";
}

function reset(page: Page) {
    page.css = "";
    page.actionBarHidden = false;
    page.backgroundSpanUnderStatusBar = false;
    page.actionBar.backgroundColor = unsetValue;
} 
