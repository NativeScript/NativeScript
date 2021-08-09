import { EventData } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';
import { Page } from '@nativescript/core/ui/page';
import { MultiTemplatesViewModel } from './multi-templates-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new MultiTemplatesViewModel();
}

export function getOddEvenTemplate(item: number, index: number, items: ObservableArray<number>): string {
	return index % 2 === 0 ? 'even' : '';
}
