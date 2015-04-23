import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import buttonModule = require("ui/button");
import enums = require("ui/enums");

export function createPage() {
    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = enums.Orientation.vertical;

    var stateLabel = new labelModule.Label();
    stateLabel.text = "INITIAL STATE";
    stackLayout.addChild(stateLabel);

    var changeStateButton = new buttonModule.Button();
    changeStateButton.text = "CHANGE STATE";
    changeStateButton.on(buttonModule.Button.tapEvent, () => {
        stateLabel.text = "CHANGED STATE";
    });
    stackLayout.addChild(changeStateButton);

    var navigateButton = new buttonModule.Button();
    navigateButton.text = "->";
    navigateButton.on(buttonModule.Button.tapEvent, () => {
        page.frame.navigate("NavigationTest/page2");
    });
    stackLayout.addChild(navigateButton);

    var page = new pagesModule.Page();
    page.content = stackLayout;
    return page;
}

//export var Page = page;

