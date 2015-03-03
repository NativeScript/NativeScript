import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import buttonModule = require("ui/button");
import textFieldModule = require("ui/text-field");
import enums = require("ui/enums");

export function createPage() {
    var page = new pagesModule.Page();

    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = enums.Orientation.vertical;

    var backButton = new buttonModule.Button();
    backButton.text = "< back";
    backButton.on(buttonModule.knownEvents.tap, () => { page.frame.goBack(); });
    stackLayout.addChild(backButton);

    var label = new labelModule.Label();
    stackLayout.addChild(label);

    page.on(pagesModule.knownEvents.navigatedTo, () => {
        var item = page.navigationContext;
        label.text = "I am detail for " + item;
    });

    var textField = new textFieldModule.TextField();
    textField.text = "Write something and click the Copy button...";
    stackLayout.addChild(textField);

    var actionButton = new buttonModule.Button();
    actionButton.text = "Copy";
    actionButton.on(buttonModule.knownEvents.tap, () => {
        label.text = textField.text;
    });
    stackLayout.addChild(actionButton);

    page.content = stackLayout;
    return page;
}

//export var Page = page;
