import pages = require("ui/page");
import slider = require("ui/slider");
import imageSource = require("image-source");
import gridModule = require("ui/layouts/grid-layout");
import enums = require("ui/enums");

export function createPage() {
    var StackLayout = require("ui/layouts/stack-layout").StackLayout;
    var Image = require("ui/image").Image;

    var stack = new StackLayout();
    var grid = new gridModule.GridLayout();

    grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.star));

    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.star));

    var sldr = new slider.Slider();
    gridModule.GridLayout.setColumnSpan(sldr, 2);
    sldr.maxValue = 500;
 
    stack.addChild(sldr);
    stack.addChild(grid);

    var image = new Image();
    image.stretch = enums.Stretch.fill;
    image.verticalAlignment = 2;
    image.horizontalAlignment = 1;

    image.source = imageSource.fromFile(__dirname + "test.png");
    grid.addChild(image);

    var page = new pages.Page();
    page.content = stack;
    page.css = "GridLayout { background-color: pink } image { background-color: green }";
    return page;
}
//export var Page = page; 