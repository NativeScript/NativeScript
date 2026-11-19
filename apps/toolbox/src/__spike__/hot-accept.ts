/// <reference types="@nativescript/vite/client" />
import { Observable } from '@nativescript/core';
import { helper } from './helper';

export const model = new Observable();
export function value() {
	return helper(2);
}

if (import.meta.hot) {
	import.meta.hot.accept((mod) => {
		console.log('accepted', mod?.value());
	});
	import.meta.hot.dispose((data) => {
		data.count = (data.count ?? 0) + 1;
	});
}
