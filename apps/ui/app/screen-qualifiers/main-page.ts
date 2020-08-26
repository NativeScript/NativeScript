import { EventData } from '@nativescript/core/data/observable';
import { Observable } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;

	page.bindingContext = new Observable();
	page.bindingContext.set('currentDate', new Date());
}
