import { Utils } from '@nativescript/core';
import { square } from './worker-helper';

const scope = globalThis as unknown as {
	onmessage: ((event: { data: number }) => void) | null;
	postMessage(data: unknown): void;
};

scope.onmessage = (event) => {
	scope.postMessage({
		square: square(event.data),
		platform: __APPLE__ ? 'apple' : __ANDROID__ ? 'android' : 'unknown',
		dev: __DEV__,
		core: Utils.isNumber(event.data),
	});
};
