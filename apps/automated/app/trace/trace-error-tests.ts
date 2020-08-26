import { Trace, TraceErrorHandler } from '@nativescript/core';
import * as TKUnit from '../tk-unit';

let cachedErrorHandler: TraceErrorHandler;
export function setUpModule() {
	cachedErrorHandler = Trace.getErrorHandler();
}

// before each
export function tearDown() {
	Trace.setErrorHandler(cachedErrorHandler);
}

export function test_DefaultErrorHandler_throws() {
	Trace.setErrorHandler(new Trace.DefaultErrorHandler());
	TKUnit.assertThrows(
		() => {
			Trace.error(new Error('TEST'));
		},
		'DefaultErrorHandler should throw.',
		'TEST'
	);
}

export function test_trace_error_should_call_handler() {
	let called = false;
	Trace.setErrorHandler({
		handlerError() {
			called = true;
		},
	});
	Trace.error(new Error('TEST'));

	TKUnit.assert(called, 'Trace.error() should call handler');
}

export function test_trace_error_should_create_error_from_string() {
	let called = false;
	let actualError: Error;
	Trace.setErrorHandler({
		handlerError(error) {
			called = true;
			actualError = error;
		},
	});
	Trace.error('TEST');

	TKUnit.assert(called, 'Trace.error() should call handler;');
	TKUnit.assert(actualError instanceof Error, 'Trace.error() wrap string in error');
}

export function test_trace_error_should_pass_errors() {
	let called = false;
	let testError = new Error('TEST');
	let actualError: Error;

	Trace.setErrorHandler({
		handlerError(error) {
			called = true;
			actualError = error;
		},
	});
	Trace.error(testError);

	TKUnit.assert(called, 'Trace.error() should call handler;');
	TKUnit.assertDeepEqual(actualError, testError);
}
