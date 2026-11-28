import { addCss } from '@nativescript/core/application';

export function onLoaded(args) {
	const page = args.object;
	page.addCss('#property { background-color: lightsalmon; }');
}

export function onTap() {
	addCss('#app { background-color: lightblue; }');
}
