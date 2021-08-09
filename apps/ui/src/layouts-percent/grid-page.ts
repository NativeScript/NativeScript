import * as model from './myview';
import { Button } from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';
import { GridLayout, ItemSpec, GridUnitType } from '@nativescript/core/ui/layouts/grid-layout';

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <Page>args.object;
	page.bindingContext = new model.ViewModelWithPercentage();
}

export function onAddRowColumn(args: { eventName: string; object: any }) {
	var layout = <GridLayout>args.object.parent.parent;
	var row = new ItemSpec(1, GridUnitType.AUTO);
	var column = new ItemSpec(1, GridUnitType.AUTO);

	layout.addRow(row);
	layout.addColumn(column);

	var btn0 = new Button();
	var btn1 = new Button();
	btn0.id = 'b0';
	btn1.id = 'b1';
	btn0.text = 'b0';
	btn1.text = 'b1';
	layout.addChild(btn0);
	layout.addChild(btn1);
	GridLayout.setRow(btn0, 0);
	GridLayout.setColumn(btn0, 4);
	GridLayout.setRow(btn1, 4);
	GridLayout.setColumn(btn1, 0);
	GridLayout.setColumnSpan(btn1, 2);
	GridLayout.setRowSpan(btn0, 3);
}

export function onRemoveRowColumn(args: { eventName: string; object: any }) {
	var layout = <GridLayout>args.object.parent.parent;
	var itemSpecs, count;
	itemSpecs = layout.getRows();
	count = itemSpecs.length;
	layout.removeRow(itemSpecs[count - 1]);
	itemSpecs = layout.getColumns();
	count = itemSpecs.length;
	layout.removeColumn(itemSpecs[count - 1]);
}
