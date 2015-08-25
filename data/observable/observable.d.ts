/**
 * Contains the Observable class, which represents an observable object, or "data" in the model-view paradigm.
 */
declare module "data/observable" {
    /**
     * Base event data.
     */
    interface EventData {
        /**
         * The name of the event.
         */
        eventName: string;
        /**
         * The Observable instance that has raised the event.
         */
        object: Observable;
    }

    /**
     * Data for the "propertyChange" event.
     */
    interface PropertyChangeData extends EventData {
        /**
         * The name of the property that has changed.
         */
        propertyName: string;
        /**
         * The new value of the property.
         */
        value: any;
    }

    /**
     * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
     */
    class Observable {
        /**
         * String value used when hooking to propertyChange event.
         */
        public static propertyChangeEvent: string;

        /**
         * Creates an Observable instance and sets its properties accroding to the supplied JSON object.
         */
        constructor(json?: any);

        /**
         * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
         */
        typeName: string;

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

        /**
         * Raised when a propertyChange occurs.
         */
        on(event: "propertyChange", callback: (data: EventData) => void, thisArg?: any);

        /**
         * Shortcut alias to the removeEventListener method.
         */
        off(eventNames: string, callback?: any, thisArg?: any);

        /**
         * Adds a listener for the specified event name.
         * @param eventNames Comma delimited names of the events to attach the listener to.
         * @param callback A function to be called when some of the specified event(s) is raised.
         * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
         */
        addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

        /**
         * Removes listener(s) for the specified event name.
         * @param eventNames Comma delimited names of the events the specified listener is associated with.
         * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
         * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
         */
        removeEventListener(eventNames: string, callback?: any, thisArg?: any);

        /**
         * Updates the specified property with the provided value.
         */
        set(name: string, value: any): void;

        /**
         * Gets the value of the specified property.
         */
        get(name: string): any;

        /**
         * Notifies all the registered listeners for the event provided in the data.eventName.
         * @param data The data associated with the event.
         */
        notify(data: EventData): void;

        /**
         * Notifies all the registered listeners for the property change event.
         */
        notifyPropertyChange(propertyName: string, newValue: any): void;

        /**
         * Checks whether a listener is registered for the specified event name.
         * @param eventName The name of the event to check for.
         */
        hasListeners(eventName: string): boolean;

        //@private
        /**
         * This method is intended to be overriden by inheritors to provide additional implementation.
         */
        _setCore(data: PropertyChangeData);
        _createPropertyChangeData(name: string, value: any): PropertyChangeData;
        _emit(eventNames: string);
        //@endprivate
    }
}