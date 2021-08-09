import { TextView } from '@nativescript/core/ui/text-view';
import * as gestures from '@nativescript/core/ui/gestures';

export function onTouch(args: gestures.TouchGestureEventData) {
	let msg = ' touch action: ' + args.action + ' x: ' + Math.round(args.getX()) + ' y: ' + Math.round(args.getY()) + ' count: ' + args.getPointerCount();

	let p;
	msg += ' ACTIVE: ';
	let pointers = args.getActivePointers();
	for (let index = 0; index < pointers.length; index++) {
		p = pointers[index];
		msg += ' p' + index + '[' + Math.round(p.getX()) + ', ' + Math.round(p.getY()) + ']';
	}

	msg += ' ALL: ';
	pointers = args.getAllPointers();
	for (let index = 0; index < pointers.length; index++) {
		p = pointers[index];
		msg += ' p' + index + '[' + Math.round(p.getX()) + ', ' + Math.round(p.getY()) + ']';
	}

	console.log(msg);
	(<TextView>args.view.page.getViewById('output')).text += msg + '\n';
}

export function clear(args) {
	args.object.page.getViewById('output').text = '';
}
