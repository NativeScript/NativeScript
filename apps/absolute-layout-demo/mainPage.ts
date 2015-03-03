import pagesModule = require("ui/page");
import enums = require("ui/enums");
import absoluteLayoutModule = require("ui/layouts/absolute-layout");
import labelModule = require("ui/label");
import colorModule = require("color");

export function createPage() {
    var colors = [
        new colorModule.Color("Red"),
        new colorModule.Color("LightGreen"),
        new colorModule.Color("LightBlue"),
        new colorModule.Color("Yellow")
    ];

    var c = 0;

    function generateChild(width?: number, height?: number) {
        var label = new labelModule.Label();

        if (!width) {
            width = 80 + Math.round(Math.random() * 40);
        }

        if (!height) {
            height = 80 + Math.round(Math.random() * 40);
        }

        label.width = width;
        label.height = height;
        label.text = "L" + c + "(" + label.width + "x" + label.height + ")";
        label.style.textAlignment = enums.TextAlignment.center;
        label.style.backgroundColor = colors[c % 4];
        c++;
        return label;
    }

    var absLayout = new absoluteLayoutModule.AbsoluteLayout();
    absLayout.width = 300;
    absLayout.height = 300;
    absLayout.style.backgroundColor = new colorModule.Color("LightGray");

    var x = 0.0;
    var y = 0.0;
    for (var i = 0; i < 10; i++) {
        var child = generateChild(50, 50);
        absoluteLayoutModule.AbsoluteLayout.setLeft(child, x);
        absoluteLayoutModule.AbsoluteLayout.setTop(child, y);
        absLayout.addChild(child);
        x += 25;
        y += 25;
    }
    var page = new pagesModule.Page();
    page.content = absLayout;
    return page;
}
//export var Page = page;