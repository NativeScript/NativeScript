import * as view from '@nativescript/core/ui/core/view';
import * as pages from '@nativescript/core/ui/page';

export function loaded(args) {
	var page = <pages.Page>(<view.View>args.object).page;
	const view = page.getViewById('test-element');
	(<any>view).textTransform = 'capitalize';
}

export function applyTap(args) {
	var page = <pages.Page>(<view.View>args.object).page;
	var css = '#test-element { ' + args.object.tag + ' }';
	page.css = css;
}

export function resetTap(args) {
	var page = <pages.Page>(<view.View>args.object).page;
	page.css = '';
}
