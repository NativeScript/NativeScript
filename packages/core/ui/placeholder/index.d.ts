import { View } from '../core/view';
import { EventData } from '../../data/observable';

export * from './placeholder-common';

/**
 * Represents a Placeholder, which is used to add a native view to the visual tree.
 */
export class Placeholder extends View {
	/**
	 * String value used when hooking to creatingView event.
	 */
	public static creatingViewEvent: string;

	/**
	 * Adds a listener for the specified event name.
	 *
	 * @param eventName The name of the event.
	 * @param callback The event listener to add. Will be called when an event of
	 * the given name is raised.
	 * @param thisArg An optional parameter which, when set, will be bound as the
	 * `this` context when the callback is called. Falsy values will be not be
	 * bound.
	 */
	on(eventName: string, callback: (args: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when a creatingView event occurs.
	 */
	on(event: 'creatingView', callback: (args: CreateViewEventData) => void, thisArg?: any): void;
}

/**
 * Event data containing information for creating a native view that will be added to the visual tree.
 */
export interface CreateViewEventData extends EventData {
	/**
	 * The native view that should be added to the visual tree.
	 */
	view: any;

	/**
	 * An optional context for creating the view.
	 */
	context?: any;
}
