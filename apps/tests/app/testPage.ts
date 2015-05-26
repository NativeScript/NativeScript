import frame = require("ui/frame");
import pageModule = require("ui/page");
import textViewModule = require("ui/text-view");

export function buttonTap(args) { 
    console.log("tap");
}

export function doubleTap(args) {
    console.log("doubleTap");
}

export function checkRecognizers(args) {
    var testTextView = <textViewModule.TextView>(page.getViewById("testTextView"));
    console.log("testTextView: " + testTextView.ios.gestureRecognizers);
}

var page: pageModule.Page;

export function pageLoaded(args) {
    page = <pageModule.Page>args.object;
}