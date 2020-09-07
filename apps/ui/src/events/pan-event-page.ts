import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { PanGestureEventData } from '@nativescript/core/ui/gestures';
import { View } from '@nativescript/core/ui/core/view';
import { TextView } from '@nativescript/core/ui/text-view';

var view: View;
export function navigatingTo(args: EventData) {
	var page = <Page>args.object;
	view = page.getViewById<View>('target');
}

export function onPan(data: PanGestureEventData) {
	console.log(`data state:${data.state} [${data.deltaX}, ${data.deltaY}]`);
	var msg = `data state:${data.state} [${data.deltaX}, ${data.deltaY}]`;
	(<TextView>view.page.getViewById('output')).text += msg + '\n';
	view.translateX = data.deltaX;
	view.translateY = data.deltaY;
}

export function clear(args) {
	args.object.page.getViewById('output').text = '';
}
