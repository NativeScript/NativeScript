import * as pages from "ui/page";
import * as frame from "ui/frame";
import * as stackModule from "ui/layouts/stack-layout";
import * as button from "ui/button";
import * as text from "ui/text-field";

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
