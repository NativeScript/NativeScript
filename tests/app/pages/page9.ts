import * as pages from "ui/page";
import * as imageSource from "image-source";
import * as gridModule from "ui/layouts/grid-layout";
import * as enums from "ui/enums";
import * as img from "ui/image";

export function createPage() {
    var grid = new gridModule.GridLayout();

    grid.addColumn(new gridModule.ItemSpec(1, "auto"));
    grid.addColumn(new gridModule.ItemSpec(1, "star"));

    grid.addRow(new gridModule.ItemSpec(1, "auto"));
    grid.addRow(new gridModule.ItemSpec(1, "star"));

    var image = new img.Image();
    image.stretch = "fill";
    image.verticalAlignment = "bottom";
    image.horizontalAlignment = "center";

    image.imageSource = imageSource.fromFile(__dirname + "/test.png");
    grid.addChild(image);

    var page = new pages.Page();
    page.content = grid;
    page.css = "GridLayout { background-color: pink } image { background-color: green }";
    return page;
}
