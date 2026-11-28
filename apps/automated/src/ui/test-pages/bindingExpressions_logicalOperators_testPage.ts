import * as pages from '@nativescript/core/ui/page';

export function pageLoaded(args) {
	const page = <pages.Page>args.object;
	page.bindingContext = { varFalse: false, varTrue: true, varText: 'Text' };
}
