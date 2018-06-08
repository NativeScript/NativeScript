import {
    ErrorHandler, getErrorHandler, setErrorHandler, DefaultErrorHandler,
    error as traceError
} from "tns-core-modules/trace";
import * as TKUnit from "../TKUnit";
import { constants } from "zlib";
import { trace } from "tns-core-modules/profiling/profiling";

let cachedErrorHandler: ErrorHandler;
export function setUpModule() {
    cachedErrorHandler = getErrorHandler();
}

// before each
export function tearDown() {
    setErrorHandler(cachedErrorHandler)
}

export function test_DefaultErrorHandler_throws() {
    setErrorHandler(new DefaultErrorHandler());
    TKUnit.assertThrows(() => {
        traceError(new Error("TEST"))
    }, "DefaultErrorHandler should throw.", "TEST")
}

export function test_trace_error_should_call_handler() {
    let called = false;
    setErrorHandler({
        handlerError() {
            called = true;
        }
    });
    traceError(new Error("TEST"));

    TKUnit.assert(called, "trace.error() should call handler")
}

export function test_trace_error_should_create_error_from_string() {
    let called = false;
    setErrorHandler({
        handlerError(error) {
            called = true;
            TKUnit.assert(error instanceof Error, "trace.error() wrap string in error")
        }
    });
    traceError("TEST");

    TKUnit.assert(called, "trace.error() should call handler;")
}

export function test_trace_error_should_pass_errors() {
    let called = false;
    let testError = new Error("TEST");
    
    setErrorHandler({
        handlerError(error) {
            called = true;
            TKUnit.assertDeepEqual(error, testError)
        }
    });
    traceError(testError);

    TKUnit.assert(called, "trace.error() should call handler;")
}
