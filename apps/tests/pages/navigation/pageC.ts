import pages = require("ui/page");
import frame = require("ui/frame");
import stackModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import text = require("ui/text-field");

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();

    var newActivity = new button.Button();
    newActivity.text = "start activity";
    newActivity.on(button.knownEvents.tap, function () {
        var newFrame = new frame.Frame();
        var newPage = "tests/pages/navigation/pageA-new-activity";
        newFrame.navigate(newPage);
    });
    stack.addChild(newActivity);

    var btn = new button.Button();
    btn.text = "Page A ???";
    btn.on(button.knownEvents.tap, function () {
        var nextPage = "tests/pages/navigation/pageA";
        frame.topmost().navigate(nextPage);
    });
    stack.addChild(btn);

    var backBtn = new button.Button();
    backBtn.text = "BACK";
    backBtn.on(button.knownEvents.tap, function () {
        frame.topmost().goBack();
    });
    stack.addChild(backBtn);

    var txt = new text.TextField();
    txt.text = "text C";
    stack.addChild(txt);

    page.content = stack;
    return page;
}
//export var Page = page;
