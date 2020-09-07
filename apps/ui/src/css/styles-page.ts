import { addCss } from '@nativescript/core/application';

export function onLoaded(args) {
	var page = args.object;
	page.addCss('#property { background-color: lightsalmon; }');
}

export function onTap() {
	addCss('#app { background-color: lightblue; }');
}
