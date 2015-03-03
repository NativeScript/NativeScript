import pages = require("ui/page");
import button = require("ui/button");
import panelModule = require("ui/layouts/stack-layout");

export function createPage() {

    // https://github.com/NativeScript/cross-platform-modules/issues/61

    var stackPanel = new panelModule.StackLayout();
    stackPanel.id = "stackPanel";

    var btn = new button.Button();
    btn.text = "getViewById";

    var page = new pages.Page();
    page.content = stackPanel;
    page.getViewById<panelModule.StackLayout>("stackPanel").addChild(btn);

    return page;
}