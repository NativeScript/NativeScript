import pages = require("ui/page");
import frame = require("ui/frame");
import button = require("ui/button");
import text = require("ui/text-view");
import dialogs = require("ui/dialogs");
import gridModule = require("ui/layouts/grid-layout");
import fs = require("file-system");
import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.Test);

export function createPage() {
    var txtInput = new text.TextView();
    var btn = new button.Button();
    btn.text = "Run";
    btn.on(button.Button.tapEvent, function () {

        var fileName = fs.path.join(__dirname, "pages", txtInput.text);
        if ((fs.File.exists(fileName + ".xml") || (fs.File.exists(fileName + ".js")))) {
            frame.topmost().navigate("pages/" + txtInput.text);
        }
        else {
            var fileName = fs.path.join(__dirname, txtInput.text, txtInput.text);
            if ((fs.File.exists(fileName + ".xml") || (fs.File.exists(fileName + ".js")))) {
                frame.topmost().navigate(txtInput.text + "/" + txtInput.text);
            }
            else {
                dialogs.alert("Cannot find page: " + txtInput.text);
            }
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
