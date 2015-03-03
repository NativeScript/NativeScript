import pagesModule = require("ui/page");
import enums = require("ui/enums");
import wrapLayoutModule = require("ui/layouts/wrap-layout");
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
        label.marginTop = 2;
        label.marginRight = 2;
        label.marginBottom = 2;
        label.marginLeft = 2;
        label.style.textAlignment = enums.TextAlignment.center;
        label.style.backgroundColor = colors[c % 4];
        c++;
        return label;
    }

    var wrapLayout = new wrapLayoutModule.WrapLayout();
    //wrapLayout.orientation = enums.Orientation.horizontal;
    //wrapLayout.itemWidth = 50;
    //wrapLayout.itemHeight = 50;

    for (var i = 0; i < 100; i++) {
        wrapLayout.addChild(generateChild(100, 100));
        //wrapLayout.addChild(generateChild());
    }

    var page = new pagesModule.Page();
    page.content = wrapLayout;
    return page;
}
//export var Page = page;