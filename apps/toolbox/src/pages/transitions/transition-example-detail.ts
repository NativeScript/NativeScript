import { Observable, EventData, Page, NavigatedData } from '@nativescript/core';
let page: Page;

export function navigatingTo(args: NavigatedData) {
	bindPage(args, args.context);
}

let closeCallback;

export function onShownModally(args) {
	bindPage(args, args.context);
	closeCallback = args.closeCallback;
}

function bindPage(args, context: any) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel(context);
}

export class TransitionsModel extends Observable {
	example1 = true;
	example2: boolean;
	example3: boolean;
	dynamicTag: string;
	constructor(options: { isModal?: boolean; example2?: boolean; example3?: boolean; dynamicTag?: string }) {
		super();
		this.example1 = options.example2 || options.example3 ? false : true;
		this.example2 = options.example2;
		this.example3 = options.example3;
		this.dynamicTag = options.dynamicTag;
	}
	close() {
		if (closeCallback) {
			closeCallback();
		}
	}
}
