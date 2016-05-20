import {Page} from "ui/page";
import * as trace from "trace";
import tests = require("../testRunner");
import {Label} from "ui/label";

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

// When debugging
//trace.setCategories(trace.categories.concat(
//    trace.categories.Test,
//    trace.categories.Navigation,
//    trace.categories.Transition,
//    trace.categories.NativeLifecycle,
//    trace.categories.ViewHierarchy,
//    trace.categories.VisualTreeEvents
//));

let page = new Page();
page.id = "mainPage";

page.on(Page.navigatedToEvent, onNavigatedTo);

function onNavigatedTo(args) {
    let label = new Label();
    label.text = "Running non-UI tests...";
    page.content = label
    args.object.off(Page.navigatedToEvent, onNavigatedTo);
    setTimeout(function () {
        tests.runAll();
    }, 10);

}
export function createPage() {
    return page;
}