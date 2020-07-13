import { EventData } from '../../data/observable';

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
