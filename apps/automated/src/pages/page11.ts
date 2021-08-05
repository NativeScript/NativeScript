import * as gridModule from '@nativescript/core/ui/layouts/grid-layout';
import * as sp from '@nativescript/core/ui/layouts/stack-layout';
import * as button from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';

export function createPage() {
	var StackLayout = new sp.StackLayout();
	var grid = new gridModule.GridLayout();
	grid.horizontalAlignment = 'left';

	StackLayout.addChild(grid);

	var btn1 = new button.Button();
	btn1.text = 'btn1';
	var btn2 = new button.Button();
	btn2.text = 'btn2';
	var btn3 = new button.Button();
	btn3.text = 'btn3';
	var btn4 = new button.Button();
	btn4.text = 'btn4';

	grid.addChild(btn2);
	grid.addChild(btn3);
	grid.addChild(btn4);

	var sp1 = new sp.StackLayout();
	sp1.orientation = 'horizontal';
	sp1.height = 200;

	var b1 = new button.Button();
	b1.text = 'nested Btn1';
	sp1.addChild(b1);

	var b2 = new button.Button();
	b2.text = 'nested Btn2';
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

	var page = new Page();
	//page.content = GridLayout;
	page.content = StackLayout;
	var x = 1;
	btn1.on(button.Button.tapEvent, function () {
		x++;
		var gravity;
		//btn1.android.setLayoutParams(new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT));
		if (x === 1) {
			gravity = android.view.Gravity.CENTER;
		} else if (x === 2) {
			gravity = android.view.Gravity.RIGHT | android.view.Gravity.BOTTOM;
		} else {
			gravity = android.view.Gravity.LEFT | android.view.Gravity.TOP;
			x = 0;
		}

		for (var i = 0; i < grid.getChildrenCount(); i++) {
			grid.getChildAt(i).android.setGravity(gravity);
		}
	});

	return page;
}
//export var Page = page;
