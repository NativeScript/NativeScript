import * as tests from "../testRunner";
import * as pages from "tns-core-modules/ui/page";
import * as bm from "tns-core-modules/ui/button";
import * as listViewDef from "tns-core-modules/ui/list-view";
import * as trace from "tns-core-modules/trace";
trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

export function createPage() {
    var data: string[] = [""];
    for (var testModule in tests.allTests) {
        data.push(testModule);
    }

    var listView = new listViewDef.ListView();

    listView.on(listViewDef.ListView.itemLoadingEvent, (args: listViewDef.ItemEventData) => {
        var btn = <bm.Button> args.view;
        if (btn) {
            btn.off(bm.Button.tapEvent);
        }
        else {
            btn = new bm.Button();
            args.view = btn;
        }

        if (!data[args.index]) {
            btn.text = "Run all";
            btn.on(bm.Button.tapEvent, function () {
                tests.runAll();
            });
        } else {
            var testModule = data[args.index];
            btn.text = testModule;
            btn.on(bm.Button.tapEvent, function () {
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
