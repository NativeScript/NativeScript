import pages = require("ui/page");
import gridModule = require("ui/layouts/grid-layout");
import tests = require("../testRunner");
import bm = require("ui/button");
import trace = require("trace");
import textViewModule = require("ui/text-view");

class MyTraceWriter implements trace.TraceWriter {
    public write(message: any, category: string) {
        if (textView) {
            if (textView.android) {
                textView.text = message + "\r\n" + textView.text;
            }
            else {
                textView.text = message + "\n" + textView.text;
            }
        }
    }
}

trace.addWriter(new MyTraceWriter());
trace.enable();
trace.addCategories(trace.categories.Test + "," + trace.categories.Error);

var textView = new textViewModule.TextView();
textView.editable = false;
textView.style.fontSize = 8;

export function createPage() {
    var button = new bm.Button();
    button.text = "Run Tests";
    button.on(bm.knownEvents.tap, function () {
        tests.runAll();
    });

    var grid = new gridModule.GridLayout();

    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addRow(new gridModule.ItemSpec());

    gridModule.GridLayout.setRow(textView, 1);

    grid.addChild(button);
    grid.addChild(textView);

    var page = new pages.Page();
    page.content = grid;
    return page;
}
//export var Page = page;
