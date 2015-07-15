import pages = require("ui/page");
import slider = require("ui/slider");
import imageSource = require("image-source");
import gridModule = require("ui/layouts/grid-layout");
import enums = require("ui/enums");
import img = require("ui/image");
var Image = img.Image;
export function createPage() {
    var grid = new gridModule.GridLayout();

    grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.star));

    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.star));

    var image = new Image();
    image.stretch = enums.Stretch.fill;
    image.verticalAlignment = enums.VerticalAlignment.bottom;
    image.horizontalAlignment = enums.HorizontalAlignment.center;

    image.imageSource = imageSource.fromFile(__dirname + "/test.png");
    grid.addChild(image);

    var page = new pages.Page();
    page.content = grid;
    page.css = "GridLayout { background-color: pink } image { background-color: green }";
    return page;
} 