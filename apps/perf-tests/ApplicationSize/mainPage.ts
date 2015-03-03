import pagesModule = require("ui/page");
import labelModule = require("ui/label");

export function createPage() {
    var label = new labelModule.Label();
    label.text = "Hello, world!";
    label.width = 60;
    //label.textWrap = true;

    var page = new pagesModule.Page();
    page.content = label;
    return page;
}
//export var Page = page;
