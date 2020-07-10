import { View } from '../core/view';
import { CreateViewEventData } from './placeholder-common';
import { EventData } from '../../data/observable';

export * from './placeholder-common';

export class Placeholder extends View {
	public static creatingViewEvent = 'creatingView';

	public createNativeView() {
		const args = <CreateViewEventData>{
			eventName: Placeholder.creatingViewEvent,
			object: this,
			view: undefined,
			context: this._context,
		};
		this.notify(args);

		return args.view;
	}
}
export interface Placeholder {
	on(eventNames: string, callback: (args: EventData) => void);
	on(event: 'creatingView', callback: (args: CreateViewEventData) => void);
}
