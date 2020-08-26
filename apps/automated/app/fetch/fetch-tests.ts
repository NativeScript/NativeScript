/* tslint:disable:no-unused-variable */
import * as TKUnit from '../tk-unit';
import * as types from '@nativescript/core/utils/types';

export var test_fetch_defined = function () {
	TKUnit.assert(types.isDefined(fetch), 'Method fetch() should be defined!');
};

export var test_fetch = function (done: (err: Error, res?: string) => void) {
	// >> fetch-response
	fetch('https://httpbin.org/get')
		.then(function (r) {
			// Argument (r) is Response!
			// >> (hide)
			TKUnit.assert(r instanceof Response, 'Result from fetch() should be valid Response object! Actual result is: ' + r);
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-response
};

export var test_fetch_text = function (done: (err: Error, res?: string) => void) {
	// >> fetch-string
	fetch('https://httpbin.org/get')
		.then((response) => response.text())
		.then(function (r) {
			// Argument (r) is string!
			// >> (hide)
			TKUnit.assert(types.isString(r), 'Result from text() should be string! Actual result is: ' + r);
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-string
};

export var test_fetch_json = function (done: (err: Error, res?: string) => void) {
	// >> fetch-json
	fetch('https://httpbin.org/get')
		.then((response) => response.json())
		.then(function (r) {
			// Argument (r) is JSON object!
			// >> (hide)
			TKUnit.assertNotNull(r, 'Result from json() should be JSON object!');
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-json
};

export var test_fetch_formData = function (done: (err: Error, res?: string) => void) {
	// >> fetch-formdata
	fetch('https://httpbin.org/get')
		.then((response) => response.formData())
		.then(function (r) {
			// Argument (r) is FormData object!
			// >> (hide)
			TKUnit.assert(r instanceof FormData, 'Result from formData() should be FormData object! Actual result is: ' + r);
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-formdata
};

export var test_fetch_blob = function (done: (err: Error, res?: string) => void) {
	// >> fetch-blob
	fetch('https://httpbin.org/get')
		.then((response) => response.blob())
		.then(function (r) {
			// Argument (r) is Blob object!
			// >> (hide)
			TKUnit.assertNotNull(r, 'Result from blob() should be Blob object!');
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-blob
};

export var test_fetch_arraybuffer = function (done: (err: Error, res?: string) => void) {
	// >> fetch-arraybuffer
	fetch('https://httpbin.org/get')
		.then((response) => response.arrayBuffer())
		.then(function (r) {
			// Argument (r) is ArrayBuffer object!
			// >> (hide)
			TKUnit.assertNotNull(r, 'Result from arrayBuffer() should be ArrayBuffer object!');
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-arraybuffer
};

export var test_fetch_fail_invalid_url = function (done) {
	var completed: boolean;
	var isReady = function () {
		return completed;
	};

	fetch('hgfttp://httpbin.org/get')
		.catch(function (e) {
			completed = true;
			done(null);
		})
		.catch(failOnError(done));
};

// Note: fetch is unable to do url validation
// export var test_fetch_invalid_url_fail_message = function (done) {
//     fetch("hgfttp://httpbin.org/get").catch(function (e: TypeError) {
//         TKUnit.assert(e.message.match(/Network request failed:.{2,}/), "Failure message should contain details on the failure. Actual message was: " + e.message);
//         done(null);
//     }).catch(failOnError(done));
// };

export var test_fetch_response_status = function (done) {
	// >> fetch-status-response
	fetch('https://httpbin.org/get')
		.then(function (response) {
			// Argument (response) is Response!
			var statusCode = response.status;
			// >> (hide)
			TKUnit.assert(types.isDefined(statusCode), 'response.status should be defined! Actual result is: ' + statusCode);
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-status-response
};

export var test_fetch_response_headers = function (done) {
	// >> fetch-headers-response
	fetch('https://httpbin.org/get')
		.then(function (response) {
			// Argument (response) is Response!
			// var all = response.headers.getAll();
			// >> (hide)
			TKUnit.assert(types.isDefined(response.headers), 'response.headers should be defined! Actual result is: ' + response.headers);
			done(null);
			// << (hide)
		})
		.catch(failOnError(done));
	// << fetch-headers-response
};

export var test_fetch_headers_sent = function (done) {
	fetch('https://httpbin.org/get', {
		method: 'GET',
		headers: new Headers({ 'Content-Type': 'application/json' }),
	})
		.then(function (response) {
			var result = response.headers;
			TKUnit.assert(result.get('Content-Type') === 'application/json', 'Headers not sent/received properly! Actual result is: ' + result);
			done(null);
		})
		.catch(failOnError(done));
};

export var test_fetch_post_form_data = function (done) {
	var data = new FormData();
	data.append('MyVariableOne', 'ValueOne');
	data.append('MyVariableTwo', 'ValueTwo');

	fetch('https://httpbin.org/post', {
		method: 'POST',
		headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
		body: data,
	})
		.then((r) => {
			return r.formData();
		})
		.then(function (r) {
			TKUnit.assert(r instanceof FormData, 'Content not sent/received properly! Actual result is: ' + r);
			done(null);
		})
		.catch(failOnError(done));
};

export var test_fetch_post_json = function (done) {
	// >> fetch-post-json
	fetch('https://httpbin.org/post', {
		method: 'POST',
		headers: new Headers({ 'Content-Type': 'application/json' }),
		body: JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' }),
	})
		.then((r) => r.json())
		.then(function (r) {
			// >> (hide)
			TKUnit.assert(r.json['MyVariableOne'] === 'ValueOne' && r.json['MyVariableTwo'] === 'ValueTwo', 'Content not sent/received properly! Actual result is: ' + r.json);
			done(null);
			// << (hide)
			// console.log(result);
		})
		.catch(failOnError(done));
	// << fetch-post-json
};

const failOnError = function (done: (err: Error, res?: string) => void) {
	return (e) => done(e);
};
