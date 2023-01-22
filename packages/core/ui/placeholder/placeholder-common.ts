import { EventData, Observable } from '../../data/observable';

export interface CreateViewEventData<T extends Observable = Observable> extends EventData<T> {
	/**
	 * The native view that should be added to the visual tree.
	 */
	view: any;

	/**
	 * An optional context for creating the view.
	 */
	context?: any;
}
