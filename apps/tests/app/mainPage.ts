import {Page} from "ui/page";
import * as trace from "trace";
import tests = require("../testRunner");

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

let started = false;
let page = new Page();

page.on(Page.navigatedToEvent, function () {
    if (!started) {
        started = true;
        setTimeout(function () {
            tests.runAll();
        }, 10);
    }
});

export function createPage() {
    return page;
}

