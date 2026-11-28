import * as pages from '@nativescript/core/ui/page';
import * as button from '@nativescript/core/ui/button';
import * as stackModule from '@nativescript/core/ui/layouts/stack-layout';

export function createPage() {
	const stack = new stackModule.StackLayout();

	const btn = new button.Button();
	btn.text = 'Alert';
	btn.on(button.Button.tapEvent, function () {
		alert('Alert is global');
	});

	stack.addChild(btn);

	const page = new pages.Page();
	page.content = stack;

	return page;
}
