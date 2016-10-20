
/**
 * Used to create, destroy and communicate with worker threads
 */
declare class Worker {

    /**
     * Creates a new worker with the given main script.
     * @param script The first module to be loaded on the worker thread.
     */
    public constructor(script: string);

    /**
     * Sends message to the worker thread.
     * @param message The message to be serialized and sent to the worker thread.
     */
    public postMessage(message: any) : void;

    /**
     * Terminates the execution the worker thread without calling `onclose` handler.
     */
    public terminate() : void;

    /**
     * Called by the runtime when a new message is received by the worker instance.
     */
    public onmessage : Worker.OnMessageHandler;

    /**
     * Called by the runtime when an uncaught error is propagated to the parent thread.
     */
    public onerror : Worker.OnErrorHandler;
}

/**
 * Exists only in worker context. Returns the worker global object.
 */ 
declare var self: any;

/**
 * Exists only in worker context. It is called by the runtime when a new message is received by the worker thread.
 */ 
declare var onmessage : Worker.OnMessageHandler;

/**
 * Exists only in worker context. Handles uncaught errors in the worker thread. If return false the error is propagated to the parent context and passed to Worker.onerror handler.
 */ 
declare var onerror : Worker.OnErrorHandler;

/**
 * Exists only in worker context. Called before the worker is closed with the close() function.
 */ 
declare var onclose : Worker.OnCloseHandler;

/**
 * Exists only in worker context. Sends message to the parent thread.
 */ 
declare function postMessage(message: any) : void;

/**
 * Exists only in worker context. Closes the worker thread on the next run loop tick.
 */ 
declare function close() : void;

declare namespace Worker {

    interface MessageEvent {
        data: any;
    }

    interface ErrorEvent {
        message: string;
        filename: string;
        lineno: number;
    }

    interface OnErrorHandler {
        (error: ErrorEvent): boolean;
    }    

    interface OnMessageHandler {
        (message: MessageEvent): void;
    }

    interface OnCloseHandler {
        (): void;
    }
}
