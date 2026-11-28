import { Color } from '@nativescript/core/color';
import { Page } from '@nativescript/core/ui/page';
import { View } from '@nativescript/core/ui/core/view';
import { unsetValue } from '@nativescript/core/ui/core/properties';

export function applyTap(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	const css = '#test-element { ' + args.object.tag + ' }';
	page.css = css;
}

export function applyTapOnStyledActionBar(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	page.actionBar.backgroundColor = new Color('#5DFC0A');
	page.css = '#test-element { ' + args.object.tag + ' }';
}

export function applyTapWithHiddenActionBar(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	page.actionBarHidden = true;
	page.css = '#test-element { ' + args.object.tag + ' }';
}

export function applyTapWithSpan(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	page.backgroundSpanUnderStatusBar = true;
	page.css = '#test-element { ' + args.object.tag + ' }';
}

export function applyTapOnStyledActionBarAndSpan(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	page.backgroundSpanUnderStatusBar = true;
	page.actionBar.backgroundColor = new Color('#E0115F');
	page.css = '#test-element { ' + args.object.tag + ' }';
}

export function applyTapWithActionBarHiddenAndSpan(args) {
	const page = <Page>(<View>args.object).page;

	reset(page);

	page.backgroundSpanUnderStatusBar = true;
	page.actionBarHidden = true;
	page.css = '#test-element { ' + args.object.tag + ' }';
}

function reset(page: Page) {
	page.css = '';
	page.actionBarHidden = false;
	page.backgroundSpanUnderStatusBar = false;
	page.actionBar.backgroundColor = unsetValue;
}
