import tests = require("../testRunner");
import pages = require("ui/page");
import bm = require("ui/button");
import listViewDef = require("ui/list-view");
import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.Test + "," + trace.categories.Error);

export function createPage() {
    var data: string[] = [""];
    for (var testModule in tests.allTests) {
        data.push(testModule);
    }

    var listView = new listViewDef.ListView();

    listView.on(listViewDef.knownEvents.itemLoading, (args: listViewDef.ItemEventData) => {
        var btn = <bm.Button> args.view;
        if (btn) {
            btn.off(bm.knownEvents.tap);
        }
        else {
            btn = new bm.Button();
            args.view = btn;
        }

        if (!data[args.index]) {
            btn.text = "Run all";
            btn.on(bm.knownEvents.tap, function () {
                tests.runAll();
            });
        } else {
            var testModule = data[args.index];
            btn.text = testModule;
            btn.on(bm.knownEvents.tap, function () {
                tests.runAll(testModule);
            });
        }
    });

    listView.items = data;

    var page = new pages.Page();
    page.content = listView;
    return page;
}
//export var Page = page;
