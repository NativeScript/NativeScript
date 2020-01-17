import {
    ErrorHandler, getErrorHandler, setErrorHandler, DefaultErrorHandler,
    error as traceError
} from "@nativescript/core/trace";
import * as TKUnit from "../tk-unit";

let cachedErrorHandler: ErrorHandler;
export function setUpModule() {
    cachedErrorHandler = getErrorHandler();
}

// before each
export function tearDown() {
    setErrorHandler(cachedErrorHandler);
}

export function test_DefaultErrorHandler_throws() {
    setErrorHandler(new DefaultErrorHandler());
    TKUnit.assertThrows(() => {
        traceError(new Error("TEST"));
    }, "DefaultErrorHandler should throw.", "TEST");
}

export function test_trace_error_should_call_handler() {
    let called = false;
    setErrorHandler({
        handlerError() {
            called = true;
        }
    });
    traceError(new Error("TEST"));

    TKUnit.assert(called, "trace.error() should call handler");
}

export function test_trace_error_should_create_error_from_string() {
    let called = false;
    let actualError: Error;
    setErrorHandler({
        handlerError(error) {
            called = true;
            actualError = error;
        }
    });
    traceError("TEST");

    TKUnit.assert(called, "trace.error() should call handler;");
    TKUnit.assert(actualError instanceof Error, "trace.error() wrap string in error");
}

export function test_trace_error_should_pass_errors() {
    let called = false;
    let testError = new Error("TEST");
    let actualError: Error;

    setErrorHandler({
        handlerError(error) {
            called = true;
            actualError = error;

        }
    });
    traceError(testError);

    TKUnit.assert(called, "trace.error() should call handler;");
    TKUnit.assertDeepEqual(actualError, testError);
}
