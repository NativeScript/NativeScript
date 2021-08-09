import * as pageModule from '@nativescript/core/ui/page';
import * as buttonModule from '@nativescript/core/ui/button';
import * as stackModule from '@nativescript/core/ui/layouts/stack-layout';

export function createPage() {
	var page = new pageModule.Page();
	var stackLayout = new stackModule.StackLayout();
	var btn1 = new buttonModule.Button();
	btn1.horizontalAlignment = 'left';
	btn1.verticalAlignment = 'top';
	btn1.marginTop = 10;
	btn1.marginRight = 0;
	btn1.marginBottom = 10;
	btn1.marginLeft = 20;
	btn1.text = 'top, left';

	var btn2 = new buttonModule.Button();
	btn2.horizontalAlignment = 'center';
	btn2.verticalAlignment = 'middle';
	btn2.text = 'center, center';

	var btn3 = new buttonModule.Button();
	btn3.horizontalAlignment = 'right';
	btn3.verticalAlignment = 'bottom';
	btn3.text = 'bottom, right';

	var btn4 = new buttonModule.Button();
	btn4.horizontalAlignment = 'stretch';
	btn4.verticalAlignment = 'stretch';
	btn4.text = 'stretch, stretch';

	stackLayout.addChild(btn1);
	stackLayout.addChild(btn2);
	stackLayout.addChild(btn3);
	stackLayout.addChild(btn4);

	page.content = stackLayout;

	return page;
}
