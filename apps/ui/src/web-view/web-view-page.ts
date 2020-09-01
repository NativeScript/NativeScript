export function loaded(args) {
	args.object.items = [1];
}

export function onLoaded(args) {
	console.log('### onLoaded');
}

export function onLoadStarted(args) {
	console.log('### onLoadStarted: ' + args.url);
}

export function onLoadFinished(args) {
	console.log('### onLoadFinished: ' + args.url);
}

export function onUnloaded(args) {
	console.log('### onUnloaded');
}
