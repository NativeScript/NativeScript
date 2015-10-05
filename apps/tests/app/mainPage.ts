import tests = require("../testRunner");
import trace = require("trace");
import {Page} from "ui/page";
import {GridLayout} from "ui/layouts/grid-layout";

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

export function createPage() {
    tests.runAll();

    var page = new Page();
    page.content = new GridLayout();
    return page;
}