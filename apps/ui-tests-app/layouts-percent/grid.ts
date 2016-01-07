import buttonModule = require("ui/button");
import pageModule = require("ui/page");
import gridLayoutModule = require("ui/layouts/grid-layout");
import model = require("./myview");

export function onLoaded(args: { eventName: string, object: any }) {
    var page = <pageModule.Page>args.object;
    page.bindingContext = new model.ViewModel();
}

export function onAddRowColumn(args: { eventName: string, object: any }) {
    var layout = <gridLayoutModule.GridLayout>args.object.parent.parent;
    var row = new gridLayoutModule.ItemSpec(1, gridLayoutModule.GridUnitType.auto);
    var column = new gridLayoutModule.ItemSpec(1, gridLayoutModule.GridUnitType.auto);
    layout.addRow(row);
    layout.addColumn(column);

    var btn0 = new buttonModule.Button();
    var btn1 = new buttonModule.Button();
    btn0.id = "b0";
    btn1.id = "b1";
    btn0.text = "b0";
    btn1.text = "b1";
    layout.addChild(btn0);
    layout.addChild(btn1);
    gridLayoutModule.GridLayout.setRow(btn0, 0);
    gridLayoutModule.GridLayout.setColumn(btn0, 4);
    gridLayoutModule.GridLayout.setRow(btn1, 4);
    gridLayoutModule.GridLayout.setColumn(btn1, 0);
    gridLayoutModule.GridLayout.setColumnSpan(btn1, 2);
    gridLayoutModule.GridLayout.setRowSpan(btn0, 3);
}

export function onRemoveRowColumn(args: { eventName: string, object: any }) {
    var layout = <gridLayoutModule.GridLayout>args.object.parent.parent;
    var itemSpecs, count;
    itemSpecs = layout.getRows();
    count = itemSpecs.length;
    layout.removeRow(itemSpecs[count - 1]);
    itemSpecs = layout.getColumns();
    count = itemSpecs.length;
    layout.removeColumn(itemSpecs[count - 1]);
}