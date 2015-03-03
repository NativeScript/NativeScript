import btns = require("ui/button");
import pages = require("ui/page");
import stacks = require("ui/layouts/stack-layout");
import scroll = require("ui/scroll-view");
import textView = require("ui/text-view");
import timer = require("timer");
import http = require("http");
import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.Style);

export function createPage() {
    function createTxt(text: string) {
        var tv = new textView.TextView();
        tv.text = text;
        return tv;
    }

    var page = new pages.Page();
    var scrollView = new scroll.ScrollView();

    function performGet() {
        console.log("Getting CSS");
        http.getString("http://192.168.54.36:8080/test.css").then(
            function (r) {
                console.log("Applying CSS");
                page.css = r;
                timer.setTimeout(performGet, 1000);
            },
            function (e) {
                console.log("Error: " + e);
                timer.setTimeout(performGet, 1000);
            });
    }

    var stack = new stacks.StackLayout();
    scrollView.content = stack;

    var counter = 0;
    var btn = new btns.Button();
    btn.text = "tap";
    btn.on(btns.knownEvents.tap, function () {
        btn.text = "hi: " + counter++;
    });
    btn.isEnabled = false;

    stack.addChild(btn);
    stack.addChild(createTxt("this is label"));

    var info = new btns.Button();
    info.text = "info";
    info.cssClass = "info";
    info.on(btns.knownEvents.tap, function () {
        info.text = "hi: " + counter++;
        btn.isEnabled = true;
    });
    stack.addChild(info);

    stack.addChild(createTxt("this is another label"));

    page.content = scrollView;
    timer.setTimeout(performGet, 2000);
    return page;
}

//export var Page = page;