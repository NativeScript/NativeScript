import * as observable from '@nativescript/core/data/observable';
import { Trace } from '@nativescript/core';
import { Button } from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';
Trace.addCategories(Trace.categories.Layout);
Trace.enable();

export function onTap(args: observable.EventData) {
	var btn = <Button>args.object;
	(<Page>btn.page).showModal('tests/pages/page21', { context: null, closeCallback: null });
}
