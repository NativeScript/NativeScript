import * as pages from '@nativescript/core/ui/page';
import * as button from '@nativescript/core/ui/button';
import * as panelModule from '@nativescript/core/ui/layouts/stack-layout';

export function createPage() {
	// https://github.com/NativeScript/cross-platform-modules/issues/61

	var stackPanel = new panelModule.StackLayout();
	stackPanel.id = 'stackPanel';

	var btn = new button.Button();
	btn.text = 'getViewById';

	var page = new pages.Page();
	page.content = stackPanel;
	page.getViewById<panelModule.StackLayout>('stackPanel').addChild(btn);

	return page;
}
