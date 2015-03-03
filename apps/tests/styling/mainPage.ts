import pagesModule = require("ui/page");
import enums = require("ui/enums");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import textFieldModule = require("ui/text-field");
import textViewModule = require("ui/text-view");
import colorModule = require("color");

export function createPage() {
    var width = 200;
    var textAlignment = enums.TextAlignment.right;

    var stack = new stackLayoutModule.StackLayout();
    var view;

    view = new buttonModule.Button();
    view.width = width;
    view.style.backgroundColor = new colorModule.Color("Blue");
    view.style.textAlignment = textAlignment;
    view.text = "Button";
    stack.addChild(view);

    view = new labelModule.Label();
    view.width = width;
    view.text = "Label";
    view.style.backgroundColor = new colorModule.Color("Green");
    view.style.textAlignment = textAlignment;
    stack.addChild(view);

    view = new textFieldModule.TextField();
    view.width = width;
    view.text = "TextField";
    view.style.backgroundColor = new colorModule.Color("Yellow");
    view.style.textAlignment = textAlignment;
    stack.addChild(view);

    view = new textViewModule.TextView();
    view.width = width;
    view.text = "TextView";
    view.style.backgroundColor = new colorModule.Color("Red");
    view.style.textAlignment = textAlignment;
    stack.addChild(view);

    var page = new pagesModule.Page();
    page.content = stack;
    return page;
}
//export var Page = page;