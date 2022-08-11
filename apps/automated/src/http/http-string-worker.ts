postMessage('stub');

// todo: figure out why this worker is including the whole core and not just the Http module
// ie. tree-shaking is not working as expected here. (same setup works in a separate app)
//
// import { getString } from '@nativescript/core/http';
//
// getString('https://httpbin.org/get').then(
// 	function (r) {
// 		postMessage(r);
// 	},
// 	function (e) {
// 		throw e;
// 	}
// );
