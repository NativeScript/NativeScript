declare module "ui/core/weak-event-listener" {
    import observable = require("data/observable");

    /**
     * An interface that defines all options needed for creating weak event listener.
     */
    export interface WeakEventListenerOptions {
        /**
         * Weak reference to the subscriber (target) of the event listener.
         */
        target: any;

        /**
         * Weak reference to an instance of observable. Observable class which emits the event.
         */
        source: observable.Observable;

        /**
         * Name of the event.
         */
        eventName: string;

        /**
         * The function which should be called when event occurs.
         */
        handler: (eventData: observable.EventData) => void;
    }

    /**
     * Represents a class that utilize work with weak event listeners.
     */
    export class WeakEventListener {
        /**
         * Creates and initialize WeakEventListener (if all required options are set).
         * @param options An instance of WeakEventListenerOptions needed to create WeakEventListener instance.
         * Returns The id of the WeakEventListener object to be used in removeWeakEventListener method.
         */
        static addWeakEventListener(options: WeakEventListenerOptions): number;

        /**
         * Removes and clears all resources from WeakEventListener.
         * @param The id of the WeakEventListener object.
         */
        static removeWeakEventListener(listenerId: number): void;

        /** 
         * Specifies how often will internal clearing of dead references will occur. 
         * Clearing will be triggered on addWeakEventListener on every N times where N is
         * the value of this property. Set 0 to disable clearing.
         */
        static cleanDeadReferencesCountTrigger: number;

        //@private
        static _cleanDeadReferences();
        static _weakEventListeners: Object;
        //@endprivate
    }
}