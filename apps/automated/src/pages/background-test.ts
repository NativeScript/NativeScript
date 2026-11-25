import * as view from '@nativescript/core/ui/core/view';
import * as pages from '@nativescript/core/ui/page';

export function applyTap(args) {
	const page = <pages.Page>(<view.View>args.object).page;
	const css = '#test-element { ' + args.object.tag + ' }';
	page.css = css;
}

export function resetTap(args) {
	const page = <pages.Page>(<view.View>args.object).page;
	page.css = '';
}
