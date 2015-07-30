import p = require("ui/page");
import gridModule = require("ui/layouts/grid-layout");
import sp = require("ui/layouts/stack-layout");
import button = require("ui/button");
import enums = require("ui/enums");
import native_api = require("native-api");

export function createPage() {
    var StackLayout = new sp.StackLayout();
    var grid = new gridModule.GridLayout();
    grid.horizontalAlignment = enums.HorizontalAlignment.left;

    StackLayout.addChild(grid);

    var btn1 = new button.Button();
    btn1.text = "btn1";
    var btn2 = new button.Button();
    btn2.text = "btn2";
    var btn3 = new button.Button();
    btn3.text = "btn3";
    var btn4 = new button.Button();
    btn4.text = "btn4";

    grid.addChild(btn2);
    grid.addChild(btn3);
    grid.addChild(btn4);

    var sp1 = new sp.StackLayout();
    sp1.orientation = enums.Orientation.horizontal;
    sp1.height = 200;

    var b1 = new button.Button();
    b1.text = "nested Btn1";
    sp1.addChild(b1);

    var b2 = new button.Button();
    b2.text = "nested Btn2";
    sp1.addChild(b2);

    grid.addChild(sp1);

    gridModule.GridLayout.setColumn(btn4, 1);
    gridModule.GridLayout.setColumn(btn3, 1);
    gridModule.GridLayout.setRow(btn2, 1);
    gridModule.GridLayout.setRow(btn4, 1);

    grid.addRow(new gridModule.ItemSpec());
    grid.addRow(new gridModule.ItemSpec());
    grid.addColumn(new gridModule.ItemSpec());
    grid.addColumn(new gridModule.ItemSpec());

    var page = new p.Page();
    //page.content = GridLayout;
    page.content = StackLayout;
    var x = 1;
    btn1.on(button.Button.tapEvent, function () {
        x++;
        var gravity;
        //btn1.android.setLayoutParams(new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT));
        if (x === 1) {
            gravity = native_api.android.view.Gravity.CENTER;
        }
        else if (x === 2) {
            gravity = native_api.android.view.Gravity.RIGHT | native_api.android.view.Gravity.BOTTOM;
        }
        else {
            gravity = native_api.android.view.Gravity.LEFT | native_api.android.view.Gravity.TOP;
            x = 0;
        }

        for (var i = 0; i < grid.getChildrenCount(); i++) {
            grid.getChildAt(i).android.setGravity(gravity);
        }
    });
    return page;
}
//export var Page = page; 
