declare module "ui/core/weak-event-listener" {
    import observable = require("data/observable");

    /**
     * Attaches a WeakEventListener.
     * @param source Observable class which emits the event.
     * @param eventName The event name.
     * @param handler The function which should be called when event occurs.
     * @param target Subscriber (target) of the event listener. It will be used as a thisArg in the handler function.
     */
    export function addWeakEventListener(source: observable.Observable, eventName: string, handler: (eventData: observable.EventData) => void, target: any) : void;

    /**
     * Removes a WeakEventListener.
     * @param source Observable class which emits the event.
     * @param eventName The event name.
     * @param handler The function which should be called when event occurs.
     * @param target Subscriber (target) of the event listener. It will be used as a thisArg in the handler function.
     */
    export function removeWeakEventListener(source: observable.Observable, eventName: string, handler: (eventData: observable.EventData) => void, target: any): void;
}