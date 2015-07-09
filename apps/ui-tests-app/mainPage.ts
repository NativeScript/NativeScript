import button = require("ui/button");
import dialogs = require("ui/dialogs");
import frame = require("ui/frame");
import gridModule = require("ui/layouts/grid-layout");
import pages = require("ui/page");
import text = require("ui/text-view");
import fs = require("file-system");
import trace = require("trace");

trace.enable();
trace.setCategories(trace.categories.Test);

var list: string[] = ["pages", "layouts", "modal-view", "bindings"];

// basePath is auto-changed when building multiple apps
var basePath = "";
export function createPage() {
    var txtInput = new text.TextView();
    var btn = new button.Button();
    btn.text = "Run";
    btn.on(button.Button.tapEvent, function () {
        var filePath, fileName, i = 0;
        while (i < list.length) {
            filePath = fs.path.join(__dirname, list[i], txtInput.text);
            if ((fs.File.exists(filePath + ".xml") || (fs.File.exists(filePath + ".js")))) {
                fileName = basePath + list[i] + "/" + txtInput.text;
                break;
            }
            i++;
        }
        if (i < list.length) {
            frame.topmost().navigate(fileName);
        } else {
            dialogs.alert("Cannot find page: " + txtInput.text);
        }
    });

    var grid = new gridModule.GridLayout();
    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addRow(new gridModule.ItemSpec());
    gridModule.GridLayout.setRow(txtInput, 1);
    grid.addChild(btn);
    grid.addChild(txtInput);

    var page = new pages.Page();
    page.content = grid;
    return page;
}