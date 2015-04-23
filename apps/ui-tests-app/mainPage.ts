import pages = require("ui/page");
import button = require("ui/button");
import trace = require("trace");
import gridModule = require("ui/layouts/grid-layout");
import text = require("ui/text-view");
import frame = require("ui/frame");
import dialogs = require("ui/dialogs");
import fs = require("file-system");
trace.enable();
trace.setCategories(trace.categories.Test);

export function createPage() {
    var basePath = "pages/";
    var txtInput = new text.TextView();

    var btn = new button.Button();
    btn.text = "Run";
    btn.on(button.Button.tapEvent, function () {
        var pagePath = basePath + txtInput.text;
        var fileName = fs.path.join(__dirname, "pages", txtInput.text);

        if ((fs.File.exists(fileName + ".js")) || (fs.File.exists(fileName + ".xml"))) {
            frame.topmost().navigate(basePath + txtInput.text);
        }
        else {
            dialogs.alert("Cannot find page: " + pagePath);
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
