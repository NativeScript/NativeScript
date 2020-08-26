import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { SwipeGestureEventData } from '@nativescript/core/ui/gestures';
import { TextView } from '@nativescript/core/ui/text-view';

let outputText: TextView;
export function navigatingTo(args: EventData) {
	var page = <Page>args.object;
	outputText = page.getViewById<TextView>('output');
}

export function onSwipe(data: SwipeGestureEventData) {
	const msg = `swipe state:${data.direction}`;
	console.log(msg);
	outputText.text += msg + '\n';
}

export function onTap(args) {
	const msg = `tapEvent triggered`;
	console.log(msg);
	outputText.text += msg + '\n';
}
