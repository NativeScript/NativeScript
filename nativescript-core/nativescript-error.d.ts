/**
 * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
 */
declare interface NativeScriptError extends Error {
    /**
     * Represents the native error object.
     */
    nativeError: any;
}
