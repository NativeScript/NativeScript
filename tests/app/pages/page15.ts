import enums = require("ui/enums");
import pageModule = require("ui/page");
import buttonModule = require("ui/button");
import stackModule = require("ui/layouts/stack-layout");

export function createPage() {
    var page = new pageModule.Page();
    var stackLayout = new stackModule.StackLayout();
    var btn1 = new buttonModule.Button();
    btn1.horizontalAlignment = enums.HorizontalAlignment.left;
    btn1.verticalAlignment = enums.VerticalAlignment.top;
    btn1.marginTop = 10;
    btn1.marginRight = 0;
    btn1.marginBottom = 10;
    btn1.marginLeft = 20;
    btn1.text = "top, left";

    var btn2 = new buttonModule.Button();
    btn2.horizontalAlignment = enums.HorizontalAlignment.center;
    btn2.verticalAlignment = enums.VerticalAlignment.center;
    btn2.text = "center, center";

    var btn3 = new buttonModule.Button();
    btn3.horizontalAlignment = enums.HorizontalAlignment.right;
    btn3.verticalAlignment = enums.VerticalAlignment.bottom;
    btn3.text = "bottom, right";

    var btn4 = new buttonModule.Button();
    btn4.horizontalAlignment = enums.HorizontalAlignment.stretch;
    btn4.verticalAlignment = enums.VerticalAlignment.stretch;
    btn4.text = "stretch, stretch";

    stackLayout.addChild(btn1);
    stackLayout.addChild(btn2);
    stackLayout.addChild(btn3);
    stackLayout.addChild(btn4);

    page.content = stackLayout;
    return page;
}