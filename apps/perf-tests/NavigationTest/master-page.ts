import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import listViewModule = require("ui/list-view");
import labelModule = require("ui/label");
import textFieldModule = require("ui/text-field");
import buttonModule = require("ui/button");
import enums = require("ui/enums");

export function createPage() {
    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = enums.Orientation.vertical;

    var listView = new listViewModule.ListView();
    listView.height = 200;
    var itemsSource = [1, 2, 3];

    listView.on(listViewModule.knownEvents.itemLoading, (args: listViewModule.ItemEventData) => {
        var label = <labelModule.Label>args.view;
        if (!label) {
            label = new labelModule.Label();
            args.view = label;
        }

        var item = itemsSource[args.index];

        if (label) {
            label.text = "Item " + item;
        }
    });

    listView.on(listViewModule.knownEvents.itemTap, (args: listViewModule.ItemEventData) => {
        var navigationEntry = {
            moduleName: "NavigationTest/details-page",
            context: itemsSource[args.index]
        };
        page.frame.navigate(navigationEntry);
    });

    listView.items = itemsSource;
    stackLayout.addChild(listView);

    var label = new labelModule.Label();
    stackLayout.addChild(label);
    label.text = "INITIAL STATE";

    var textField = new textFieldModule.TextField();
    textField.text = "CHANGED STATE";
    stackLayout.addChild(textField);

    var actionButton = new buttonModule.Button();
    actionButton.text = "Copy";
    actionButton.on(buttonModule.knownEvents.tap, () => {
        label.text = textField.text;
    });
    stackLayout.addChild(actionButton);

    var page = new pagesModule.Page();
    page.content = stackLayout;
    return page;
}

//export var Page = page;

