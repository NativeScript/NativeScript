/* tslint:disable:no-unused-variable */
import * as TKUnit from '../tk-unit';
import * as types from '@nativescript/core/utils/types';

export var test_XMLHttpRequest_isDefined = function () {
	TKUnit.assert(types.isDefined(global['XMLHttpRequest']), 'XMLHttpRequest should be defined!');
};

var xhr = new XMLHttpRequest();

export var test_XMLHttpRequest_open_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.open), 'XMLHttpRequest.open should be defined!');
};

export var test_XMLHttpRequest_send_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.send), 'XMLHttpRequest.send should be defined!');
};

export var test_XMLHttpRequest_setRequestHeader_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.setRequestHeader), 'XMLHttpRequest.setRequestHeader should be defined!');
};

export var test_XMLHttpRequest_getAllResponseHeaders_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.getAllResponseHeaders), 'XMLHttpRequest.getAllResponseHeaders should be defined!');
};

export var test_XMLHttpRequest_getResponseHeader_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.getResponseHeader), 'XMLHttpRequest.getResponseHeader should be defined!');
};

export var test_XMLHttpRequest_overrideMimeType_isDefined = function () {
	TKUnit.assert(types.isFunction(xhr.overrideMimeType), 'XMLHttpRequest.overrideMimeType should be defined!');
};

export var test_XMLHttpRequest_readyState_isDefined = function () {
	TKUnit.assert(types.isNumber(xhr.readyState), 'XMLHttpRequest.readyState should be defined!');
};

export var test_XMLHttpRequest_responseText_isDefined = function () {
	TKUnit.assert(types.isString(xhr.responseText), 'XMLHttpRequest.responseText should be defined!');
};

export var test_XMLHttpRequest_responseType_isDefined = function () {
	TKUnit.assert(types.isString(xhr.responseType), 'XMLHttpRequest.responseType should be defined!');
};

export var test_XMLHttpRequest_readyStateShouldChange = function (done) {
	var count = 0;
	// <snippet module="xhr" title="xhr">
	// ### Check readyState
	// ``` JavaScript
	let xhr = new XMLHttpRequest();

	TKUnit.assert(xhr.readyState === 0, 'xhr.readyState should be UNSENT!');

	xhr.onreadystatechange = function () {
		// var state = xhr.readyState;
		// <hide>
		try {
			if (count === 0) {
				TKUnit.assert(xhr.readyState === 1, 'xhr.readyState should be OPEN!');
			} else if (count === 1) {
				TKUnit.assert(xhr.readyState === 2, 'xhr.readyState should be HEADERS_RECEIVED!');
			} else if (count === 2) {
				TKUnit.assert(xhr.readyState === 3, 'xhr.readyState should be LOADING!');
			} else if (count === 3) {
				TKUnit.assert(xhr.readyState === 4, 'xhr.readyState should be DONE!');
			}

			count++;

			done(null);
		} catch (err) {
			done(err);
		}
		// </hide>
	};

	xhr.open('GET', 'https://httpbin.org/get');
	xhr.send();
	// ```
	// </snippet>
};

export var test_XMLHttpRequest_headersSentAndReceivedProperly = function (done) {
	// <snippet module="xhr" title="xhr">
	// ### Send/receive headers
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://httpbin.org/get');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 1) {
			// var contentTypeHeader = xhr.getResponseHeader("Content-Type");
			// <hide>
			try {
				TKUnit.assert(xhr.getResponseHeader('Content-Type') === 'application/json', 'Headers not sent/received properly!');
				done(null);
			} catch (err) {
				done(err);
			}
			// </hide>
		}
	};
	xhr.send();
	// ```
	// </snippet>
};

export var test_XMLHttpRequest_contentSentAndReceivedProperly = function (done) {
	// <snippet module="xhr" title="xhr">
	// ### Send/receive JSON
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://httpbin.org/post');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 3) {
			// <hide>
			try {
				TKUnit.assert(xhr.response.json.MyVariableOne === 'ValueOne' && xhr.response.json.MyVariableTwo === 'ValueTwo', 'Response content not parsed properly!' + JSON.stringify(xhr.response));
				done(null);
			} catch (err) {
				done(err);
			}
			// </hide>
		}
	};
	xhr.send(JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' }));
	// ```
	// </snippet>
};

export var test_XMLHttpRequest_FormDataContentSentAndReceivedProperly = function (done) {
	// <snippet module="xhr" title="xhr">
	// ### Send/receive FormData
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://httpbin.org/post');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 3) {
			var result = JSON.parse(xhr.responseText);
			// var valueOne = result["form"]["MyVariableOne"];
			// <hide>
			try {
				TKUnit.assert(result['form']['MyVariableOne'] === 'ValueOne' && result['form']['MyVariableTwo'] === 'ValueTwo', 'Content not sent/received properly! Result is: ' + xhr.responseText);
				done(null);
			} catch (err) {
				done(err);
			}
			// </hide>
		}
	};

	var data = new FormData();
	data.append('MyVariableOne', 'ValueOne');
	data.append('MyVariableTwo', 'ValueTwo');

	xhr.send(data);
	// ```
	// </snippet>
};

export var test_XMLHttpRequest_abortShouldCancelonreadystatechange = function (done) {
	let flag = false;
	// <snippet module="xhr" title="xhr">
	// ### Abort request
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://httpbin.org/post');
	xhr.setRequestHeader('Content-Type', 'application/json');
	// <hide>
	xhr.onreadystatechange = function () {
		flag = true;
	};
	// </hide>
	xhr.send(JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' }));
	xhr.abort();
	// ```
	// </snippet>
	TKUnit.assert(flag, 'Content not sent/received properly!');
	done(null);
};

export var test_XMLHttpRequest_requestShouldBePossibleAfterAbortedOpen = function (done) {
	xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://httpbin.org/post');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 3) {
			var result = JSON.parse(xhr.responseText);
			try {
				TKUnit.assert(result['json']['MyVariableOne'] === 'ValueOne' && result['json']['MyVariableTwo'] === 'ValueTwo', 'Content not sent/received properly!');
				done(null);
			} catch (err) {
				done(err);
			}
		}
	};

	xhr.abort();

	xhr.send(JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' }));
};

export var test_XMLHttpRequest_requestShouldntBePossibleAfterAbortedSentRequest = function () {
	xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://httpbin.org/post');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' }));
	xhr.abort();

	TKUnit.assertThrows(() => xhr.send(JSON.stringify({ MyVariableOne: 'ValueOne', MyVariableTwo: 'ValueTwo' })), "Didn't raise re-attempt to send after aborted send", "Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.");
};

export function test_ignore_zero_length_request_body() {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://httpbin.org/get');

	xhr.send('');
}

export function test_raises_onload_Event(done) {
	let xhr = new XMLHttpRequest();
	xhr.onload = () => {
		done(null);
	};
	xhr.open('GET', 'https://httpbin.org/get');
	xhr.send();
}

export function test_xhr_events() {
	let xhr = <any>new XMLHttpRequest();

	let loadCallbackFired = false,
		loadEventFired = false;
	xhr.onload = () => (loadCallbackFired = true);
	let badEvent = () => {
		throw new Error("Shouldn't call me");
	};
	xhr.addEventListener('load', () => (loadEventFired = true));
	xhr.addEventListener('load', badEvent);
	xhr.removeEventListener('load', badEvent);

	xhr._errorFlag = false;
	xhr._setReadyState(xhr.DONE);
	TKUnit.assertTrue(loadCallbackFired);
	TKUnit.assertTrue(loadEventFired);

	let errorCallbackData = null,
		errorEventData = null;
	xhr.onerror = (e) => (errorCallbackData = e);
	xhr.addEventListener('error', (e) => (errorEventData = e));
	xhr.addEventListener('error', badEvent);
	xhr.removeEventListener('error', badEvent);

	xhr._errorFlag = true;
	xhr._setRequestError('error', 'error data');
	TKUnit.assertEqual(errorCallbackData, 'error data');
	TKUnit.assertEqual(errorEventData, 'error data');
}

export function test_xhr_responseType_rss() {
	const xhr = <any>new XMLHttpRequest();
	const rawRssFeed = '<rss> <channel><item><title>Test</title></item></channel></rss>';
	const response = {
		statusCode: 200,
		content: {
			toString: function () {
				return this.raw;
			},
			raw: rawRssFeed,
		},
		headers: {
			'Content-Type': 'application/rss+xml',
		},
	};

	xhr._loadResponse(response);
	TKUnit.assertEqual(xhr.responseType, '');
	TKUnit.assertEqual(xhr.response, rawRssFeed);
}

export function test_xhr_responseType_text() {
	const xhr = <any>new XMLHttpRequest();
	const response = {
		statusCode: 200,
		content: {
			toString: function () {
				return this.raw;
			},
			raw: 'response body',
		},
		headers: {
			'Content-Type': 'text/plain',
		},
	};
	xhr._loadResponse(response);

	TKUnit.assertEqual(xhr.responseType, '');
	TKUnit.assertEqual(xhr.response, 'response body');
}

export function test_xhr_responseType_should_not_switch_to_JSON_if_header_present() {
	const xhr = <any>new XMLHttpRequest();
	const response = {
		statusCode: 200,
		content: {
			toString: function () {
				return this.raw;
			},
			raw: '{"data": 42}',
		},
		headers: {
			'Content-Type': 'application/json',
		},
	};
	xhr._loadResponse(response);

	TKUnit.assertEqual(xhr.responseType, '');
	TKUnit.assertEqual(xhr.response, '{"data": 42}');
}

export function test_xhr_responseType__should_not_switch_to_JSON_if_headers_content_type_has_json_suffix() {
	const xhr = <any>new XMLHttpRequest();
	const response = {
		statusCode: 200,
		content: {
			toString: function () {
				return this.raw;
			},
			raw: '{"data": 42}',
		},
		headers: {
			'Content-Type': 'type/media.type+json',
		},
	};
	xhr._loadResponse(response);

	TKUnit.assertEqual(xhr.responseType, '');
	TKUnit.assertEqual(xhr.response, '{"data": 42}');
}

export function test_sets_status_and_statusText(done) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState > 3) {
			try {
				TKUnit.assertEqual(xhr.status, 200);
				TKUnit.assertEqual(xhr.statusText, 'OK');
				done(null);
			} catch (err) {
				done(err);
			}
		}
	};
	xhr.open('GET', 'https://httpbin.org/get');
	xhr.send();
}

export function test_raises_onerror_Event(done) {
	let xhr = new XMLHttpRequest();
	xhr.onerror = () => {
		done(null);
	};
	xhr.open('GET', 'https://no-such-domain-httpbin.org');
	xhr.send();
}

export function test_responseType(done) {
	let xhr = new XMLHttpRequest();
	xhr.responseType = '';
	xhr.responseType = 'text';
	xhr.responseType = 'json';
	xhr.responseType = 'blob';
	xhr.responseType = 'arraybuffer';

	TKUnit.assertThrows(() => (xhr.responseType = 'document'), "Didn't raise on unsupported type.", "Response type of 'document' not supported.");
	done(null);
}

export function test_getResponseHeader() {
	const xhr = <any>new XMLHttpRequest();
	const response = {
		statusCode: 200,
		content: {
			toString: function () {
				return this.raw;
			},
			raw: '{"data": 42}',
		},
		headers: {
			'content-type': 'application/json',
		},
	};
	xhr._loadResponse(response);

	TKUnit.assertEqual(xhr.getResponseHeader('Content-Type'), 'application/json');
}

export var test_XMLHttpRequest_contentReceivedArrayBufferProperly = function (done) {
	// <snippet module="xhr" title="xhr">
	// ### Receive Blob
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://httpbin.org/image/jpeg');
	xhr.responseType = 'arraybuffer';
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 3) {
			// <hide>
			try {
				TKUnit.assertEqual(xhr.getResponseHeader('Content-Length'), '35588');
				TKUnit.assertEqual(xhr.getResponseHeader('Content-Type'), 'image/jpeg');
				TKUnit.assertEqual((xhr.response as ArrayBuffer).byteLength, 35588);
				done(null);
			} catch (err) {
				done(err);
			}
			// </hide>
		}
	};
	xhr.send();
	// ```
	// </snippet>
};

export var test_XMLHttpRequest_contentReceivedBlobProperly = function (done) {
	// <snippet module="xhr" title="xhr">
	// ### Receive Blob
	// ``` JavaScript
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://httpbin.org/image/jpeg');
	xhr.responseType = 'blob';
	xhr.onreadystatechange = function () {
		if (xhr.readyState > 3) {
			// <hide>
			try {
				TKUnit.assertEqual(xhr.getResponseHeader('Content-Length'), '35588');
				TKUnit.assertEqual(xhr.getResponseHeader('Content-Type'), 'image/jpeg');
				TKUnit.assertEqual((xhr.response as Blob).size, 35588);
				TKUnit.assertEqual((xhr.response as Blob).type, 'image/jpeg');
				done(null);
			} catch (err) {
				done(err);
			}
			// </hide>
		}
	};
	xhr.send();
	// ```
	// </snippet>
};
