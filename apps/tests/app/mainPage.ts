import {Page} from "ui/page";
import * as trace from "trace";
import tests = require("../testRunner");

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

let page = new Page();
page.id = "mainPage";

page.on(Page.navigatedToEvent, onNavigatedTo);

function onNavigatedTo(args) {
    args.object.off(Page.navigatedToEvent, onNavigatedTo);
    setTimeout(function () {
        tests.runAll();
    }, 10);

}
export function createPage() {
    return page;
}