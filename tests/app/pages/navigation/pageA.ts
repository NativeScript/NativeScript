import pages = require("ui/page");
import frame = require("ui/frame");
import stackModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import text = require("ui/text-field");
import color = require("color");
import list = require("ui/list-view");

//// Enable page caching
//frame.topmost().android.cachePagesOnNavigate = true;

export function createPage() {
    var page = new pages.Page();
    var stack = new stackModule.StackLayout();
    stack.style.backgroundColor = new color.Color("#FF8833FF");

    var btn = new button.Button();
    btn.text = "Page B";
    btn.on(button.Button.tapEvent, function () {
        var nextPage = "tests/pages/navigation/pageB";
        frame.topmost().navigate(nextPage);
    });
    stack.addChild(btn);

    var btnActivity = new button.Button();
    btnActivity.text = "start activity";
    btnActivity.on(button.Button.tapEvent, function () {
        var newPage = "tests/pages/navigation/pageA-new-activity";

        var newFrame = new frame.Frame();
        newFrame.navigate(newPage);
    });
    stack.addChild(btnActivity);

    var txt = new text.TextField();
    txt.text = "text A";
    stack.addChild(txt);

    var lv = new list.ListView();
    var data = [];
    for (var i = 0; i < 100; i++) {
        data[i] = "here is item " + i;
    }
    lv.height = 200;
    lv.items = data;
    lv.on(list.ListView.itemLoadingEvent, (args: list.ItemEventData) => {
        var btn = <button.Button> args.view;
        if (!btn) {
            btn = new button.Button();
            args.view = btn;
        }
        btn.text = data[args.index];
    });
    stack.addChild(lv);

    page.content = stack;
    return page;
}
