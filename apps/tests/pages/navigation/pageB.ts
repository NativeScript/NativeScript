import pages = require("ui/page");
import frame = require("ui/frame");
import stackModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import text = require("ui/text-field");
import color = require("color");
import scroll = require("ui/scroll-view");

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();
    stack.style.backgroundColor = new color.Color("#FFFFFF00");

    var btn = new button.Button();
    btn.text = "Page C";
    btn.on(button.Button.tapEvent, function () {
        var nextPage = "tests/pages/navigation/pageC";
        frame.topmost().navigate(nextPage);
    });
    stack.addChild(btn);

    var btnActivity = new button.Button();
    btnActivity.text = "start activity";
    btnActivity.on(button.Button.tapEvent, function () {
        var newFrame = new frame.Frame();
        var newPage = "tests/pages/navigation/pageA-new-activity";
        newFrame.navigate(newPage);
    });
    stack.addChild(btnActivity);

    var backBtn = new button.Button();
    backBtn.text = "BACK";
    backBtn.on(button.Button.tapEvent, function () {
        frame.topmost().goBack();
    });
    stack.addChild(backBtn);

    var txt = new text.TextField();
    txt.text = "text B";
    stack.addChild(txt);

    var sv = new scroll.ScrollView();
    sv.height = 200;
    stack.addChild(sv);

    var content = new stackModule.StackLayout();
    sv.content = content;
    for (var i = 0; i < 50; i++) {
        var b = new button.Button();
        b.text = "button " + i;
        content.addChild(b);
    }

    page.content = stack;
    return page;
}
//export var Page = page;
