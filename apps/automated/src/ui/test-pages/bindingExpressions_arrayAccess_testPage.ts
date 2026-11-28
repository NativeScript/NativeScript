import * as pages from '@nativescript/core/ui/page';

export function pageLoaded(args) {
	const strArr: string[] = ['tests', 'bindings', 'tests'];
	const numArr: number[] = [-1, 0, 1];
	const page = <pages.Page>args.object;
	page.bindingContext = { strArray: strArr, numArray: numArr };
}
