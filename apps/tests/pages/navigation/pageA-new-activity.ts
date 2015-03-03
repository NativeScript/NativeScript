import pages = require("ui/page");
import frame = require("ui/frame");
import stackModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import text = require("ui/text-field");

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();

    var btn = new button.Button();
    btn.text = "Page B new activity";
    btn.on(button.knownEvents.tap, function () {
        var nextPage = "app/tests/pages/navigation/pageB-new-activity";
        frame.topmost().navigate(nextPage);
    });
    stack.addChild(btn);

    var txt = new text.TextField();
    txt.text = "text new A";
    stack.addChild(txt);

    page.content = stack;
    return page;
}
//export var Page = page;
