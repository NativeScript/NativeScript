import { Observable, EventData } from '../../../data/observable';

/**
 * Attaches a WeakEventListener.
 * @param source Observable class which emits the event.
 * @param eventName The event name.
 * @param handler The function which should be called when event occurs.
 * @param target Subscriber (target) of the event listener. It will be used as a thisArg in the handler function.
 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
 */
export function addWeakEventListener(source: Observable, eventName: string, handler: (eventData: EventData) => void, target: any, options?: AddEventListenerOptions | boolean): void;

/**
 * Removes a WeakEventListener.
 * @param source Observable class which emits the event.
 * @param eventName The event name.
 * @param handler The function which should be called when event occurs.
 * @param target Subscriber (target) of the event listener. It will be used as a thisArg in the handler function.
 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
 */
export function removeWeakEventListener(source: Observable, eventName: string, handler: (eventData: EventData) => void, target: any, options?: AddEventListenerOptions | boolean): void;
