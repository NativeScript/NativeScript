import tests = require("../testRunner");
import trace = require("trace");
import {Page} from "ui/page";
import {GridLayout} from "ui/layouts/grid-layout";

trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

export function createPage() {
    var page = new Page();
    var navigatedToHandler = function() {
        tests.runAll();
        page.off("navigatedTo", navigatedToHandler);
    };
    page.on("navigatedTo", navigatedToHandler);
    return page;
}

