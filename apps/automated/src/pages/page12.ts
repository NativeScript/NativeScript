import * as pages from '@nativescript/core/ui/page';
import * as btns from '@nativescript/core/ui/button';
import * as tb from '@nativescript/core/ui/text-field';
import * as gridLayoutModule from '@nativescript/core/ui/layouts/grid-layout';

export function createPage() {
	var page = new pages.Page();
	var gridLayout = new gridLayoutModule.GridLayout();

	var lengths = [new gridLayoutModule.ItemSpec(140, 'pixel'), new gridLayoutModule.ItemSpec(1, 'star'), new gridLayoutModule.ItemSpec(140, 'pixel')];

	var rows = 2;
	var cols = 3;
	var row;
	var col;

	for (row = 0; row < rows; row++) {
		var rowDef = new gridLayoutModule.ItemSpec(1, 'auto');
		gridLayout.addRow(rowDef);
	}

	for (col = 0; col < cols; col++) {
		gridLayout.addColumn(lengths[col]);
	}

	var btn = new btns.Button();
	btn.text = 'Col: 0';
	gridLayoutModule.GridLayout.setColumn(btn, 0);
	gridLayoutModule.GridLayout.setRow(btn, 0);
	gridLayout.addChild(btn);

	var btn2 = new btns.Button();
	btn2.text = 'Col: 2';
	gridLayoutModule.GridLayout.setColumn(btn2, 2);
	gridLayoutModule.GridLayout.setRow(btn2, 0);
	gridLayout.addChild(btn2);

	var txt = new tb.TextField();
	txt.text = 'Col: 1';
	txt.width = 140;
	gridLayoutModule.GridLayout.setColumn(txt, 1);
	gridLayoutModule.GridLayout.setRow(txt, 0);
	gridLayout.addChild(txt);

	var txt2 = new tb.TextField();
	txt2.text = 'Col: All';
	gridLayoutModule.GridLayout.setColumnSpan(txt2, 3);
	gridLayoutModule.GridLayout.setRow(txt2, 1);
	gridLayout.addChild(txt2);

	page.content = gridLayout;

	return page;
}
