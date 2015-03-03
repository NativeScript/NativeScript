declare module "ui/core/weak-event-listener" {
    import observable = require("data/observable");

    /**
     * An interface that defines all options needed for creating weak event listener.
     */
    export interface WeakEventListenerOptions {
        /**
         * Weak reference to the subscriber (target) of the event listener.
         */
        targetWeakRef: WeakRef<any>;

        /**
         * Weak reference to an instance of observable.Observable class which emits the event.
         */
        sourceWeakRef: WeakRef<observable.Observable>;

        /**
         * Name of the event.
         */
        eventName: string;

        /**
         * The function which should be called when event occurs.
         */
        handler: (eventData: observable.EventData) => void;

        /**
         * The context (thisArg) in which handler should be executed.
         */
        handlerContext?: any;

        /**
         * A string to use as key for key value pair instance.
         */
        key?: string;
    }

    /**
     * Represents a class that utilize work with weak event listeners.
     */
    export class WeakEventListener {
        /**
         * Creates and initialize WeakEventListener (if all required options are set).
         * @param options An instance of WeakEventListenerOptions needed to create WeakEventListener instance.
         * Returns true if a WeakEventListener instance is created successfully.
         */
        static addWeakEventListener(options: WeakEventListenerOptions): boolean;

        /**
         * Removes and clears all resources from WeakEventListener.
         * @param options An instance of WeakEventListenerOptions used to create the WeakEventListener instance.
         */
        static removeWeakEventListener(options: WeakEventListenerOptions): void;
    }
}