import {Page} from "ui/page";
import * as trace from "trace";
import tests = require("../testRunner");
import {Label} from "ui/label";

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

let page = new Page();
page.id = "mainPage";

page.on(Page.navigatedToEvent, onNavigatedTo);

function onNavigatedTo(args) {
    let label = new Label({ text: "Running non-UI tests..." });
    page.content = label
    args.object.off(Page.navigatedToEvent, onNavigatedTo);
    setTimeout(function () {
        tests.runAll();
    }, 10);

}
export function createPage() {
    return page;
}