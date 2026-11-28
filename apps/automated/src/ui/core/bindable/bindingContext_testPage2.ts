import * as pageModule from '@nativescript/core/ui/page';

export function pageNavigatedTo(args: pageModule.NavigatedData) {
	const page = <pageModule.Page>args.object;
	page.bindingContext = args.context;
}
