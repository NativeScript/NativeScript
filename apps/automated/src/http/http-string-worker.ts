import * as http from '@nativescript/core/http';

declare var postMessage: any;

http.getString('https://httpbin.org/get').then(
	function (r) {
		postMessage(r);
	},
	function (e) {
		throw e;
	}
);
