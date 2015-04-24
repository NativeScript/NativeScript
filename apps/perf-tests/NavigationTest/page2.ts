import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import enums = require("ui/enums");

export function createPage() {
    var page = new pagesModule.Page();

    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = enums.Orientation.vertical;

    var backButton = new buttonModule.Button();
    backButton.text = "<-";
    backButton.on(buttonModule.Button.tapEvent, () => { page.frame.goBack(); });
    stackLayout.addChild(backButton);

    page.content = stackLayout;
    return page;
}

//export var Page = page;
