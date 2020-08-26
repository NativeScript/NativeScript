import { EventData, Observable } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new ImagesTemplateViewModel();
}

export class ImagesTemplateViewModel extends Observable {
	public items: Array<string> = ['res://icon', null, '~/resources/images/no-image.png', null, '~/resources/images/no-image.png', null, 'res://icon', null];
	constructor() {
		super();
	}
}
