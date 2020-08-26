import * as pages from '@nativescript/core/ui/page';

export function pageLoaded(args) {
	var strArr: string[] = ['tests', 'bindings', 'tests'];
	var numArr: number[] = [-1, 0, 1];
	var page = <pages.Page>args.object;
	page.bindingContext = { strArray: strArr, numArray: numArr };
}
