import pages = require("ui/page");
import imageSource = require("image-source");
import gridModule = require("ui/layouts/grid-layout");
import enums = require("ui/enums");

export function createPage() {
    var StackLayout = require("ui/layouts/stack-layout").StackLayout;
    var Label = require("ui/label").Label;
    var Image = require("ui/image").Image;

    var stack = new StackLayout();
    var grid = new gridModule.GridLayout();
    stack.addChild(grid);

    grid.addColumn(new gridModule.ItemSpec(80, gridModule.GridUnitType.pixel));
    grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.star));
    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));

    var defaultImageSource = imageSource.fromFile(__dirname + "/test.png");

    var img = new Image();
    img.source = defaultImageSource;

    img.width = 80;
    img.height = 80;
    img.verticalAlignment = enums.VerticalAlignment.bottom;
    gridModule.GridLayout.setRowSpan(img, 2);
    grid.addChild(img);

    var titleLabel = new Label();
    titleLabel.textWrap = true;
    titleLabel.text = "some text goes here";
    gridModule.GridLayout.setColumn(titleLabel, 1);
    grid.addChild(titleLabel);

    var commentsLabel = new Label();
    commentsLabel.text = "comments";
    commentsLabel.verticalAlignment = enums.VerticalAlignment.bottom;
    gridModule.GridLayout.setRow(commentsLabel, 1);
    gridModule.GridLayout.setColumn(commentsLabel, 1);
    grid.addChild(commentsLabel);

    var page = new pages.Page();
    page.content = stack;
    page.css = "GridLayout { background-color: yellow } image { background-color: green } label { background-color: red } stackpnael { background-color: pink }";
    return page;
}