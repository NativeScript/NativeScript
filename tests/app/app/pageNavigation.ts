import * as frame from "tns-core-modules/ui/frame";
import * as pages from "tns-core-modules/ui/page";
import * as buttonModule from "tns-core-modules/ui/button";
import * as tabViewModule from "tns-core-modules/ui/tab-view";

export function createPage() {
    var tab = new tabViewModule.TabView();
    tab.items = [];
    for (var i = 0; i < 10; i++) {

        var button = new buttonModule.Button();
        button.text = "Test";
        button.on(buttonModule.Button.tapEvent, function () {
            var topFrame = frame.topmost();
            topFrame.goBack();
        });

        let item = new tabViewModule.TabViewItem();
        item.title = "Tab " + i;
        item.view = button;
        tab.items.push(item);
    }
    var page = new pages.Page();
    page.content = tab;
    return page;
}
//export var Page = new pages.Page();
