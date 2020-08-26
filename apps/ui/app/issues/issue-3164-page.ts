import { Color } from '@nativescript/core/color';
import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { View } from '@nativescript/core/ui/core/view';

var page: Page;
var borderColor: Color = new Color('#ff0000');
export function navigatingTo(args: EventData) {
	page = <Page>args.object;
}

export function onSetBorderWidthTo0() {
	let buttonElement = <View>page.getViewById('button1');
	buttonElement.borderColor = borderColor;
	buttonElement.borderWidth = 0;

	let labelElement = <View>page.getViewById('label1');
	labelElement.borderColor = borderColor;
	labelElement.borderWidth = 0;
}

export function onSetBorderWidthTo3() {
	let buttonElement = <View>page.getViewById('button1');
	buttonElement.borderColor = borderColor;
	buttonElement.borderWidth = 3;

	let labelElement = <View>page.getViewById('label1');
	labelElement.borderColor = borderColor;
	labelElement.borderWidth = 3;
}
