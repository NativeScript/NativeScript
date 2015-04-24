import pages = require("ui/page");
import frame = require("ui/frame");
import stackModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import text = require("ui/text-field");

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();

    var btn = new button.Button();
    btn.text = "Page C new activity";
    btn.on(button.Button.tapEvent, function () {
        var nextPage = "tests/pages/navigation/pageC-new-activity";
        frame.topmost().navigate(nextPage);
    });
    stack.addChild(btn);

    var backBtn = new button.Button();
    backBtn.text = "BACK";
    backBtn.on(button.Button.tapEvent, function () {
        frame.topmost().goBack();
    });
    stack.addChild(backBtn);

    var txt = new text.TextField();
    txt.text = "text new B";
    stack.addChild(txt);

    page.content = stack;
    return page;
}
//export var Page = page;
