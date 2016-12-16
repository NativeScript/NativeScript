import * as pages from "ui/page";
import * as frame from "ui/frame";
import * as stackModule from "ui/layouts/stack-layout";
import * as button from "ui/button";
import * as text from "ui/text-field";

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();

    var newActivity = new button.Button();
    newActivity.text = "start activity";
    newActivity.on(button.Button.tapEvent, function () {
        var newFrame = new frame.Frame();
        var newPage = "tests/pages/navigation/pageA-new-activity";
        newFrame.navigate(newPage);
    });
    stack.addChild(newActivity);

    var btn = new button.Button();
    btn.text = "Page A ???";
    btn.on(button.Button.tapEvent, function () {
        var nextPage = "tests/pages/navigation/pageA";
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
    txt.text = "text C";
    stack.addChild(txt);

    page.content = stack;
    return page;
}
//export var Page = page;
