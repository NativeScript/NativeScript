import { View, Page } from '@nativescript/core';

export function applyTap(args) {
	const page = <Page>(<View>args.object).page;
	const css = '#test-element { ' + args.object.tag + ' }';
	page.css = css;
}

export function resetTap(args) {
	const page = <Page>(<View>args.object).page;
	page.css = '';
}
