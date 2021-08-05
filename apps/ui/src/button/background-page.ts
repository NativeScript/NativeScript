import { View, Page } from '@nativescript/core';

export function applyTap(args) {
	var page = <Page>(<View>args.object).page;
	var css = '#test-element { ' + args.object.tag + ' }';
	page.css = css;
}

export function resetTap(args) {
	var page = <Page>(<View>args.object).page;
	page.css = '';
}
