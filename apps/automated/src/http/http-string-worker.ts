import { Http } from '@nativescript/core';

declare var postMessage: any;

Http.getString('https://httpbin.org/get').then(
	function (r) {
		postMessage(r);
	},
	function (e) {
		throw e;
	}
);
