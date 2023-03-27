import { View } from '../core/view';
import { CreateViewEventData } from './placeholder-common';
import { EventData, Observable } from '../../data/observable';

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
	on<T extends Observable = Placeholder>(eventNames: string, callback: (args: EventData<T>) => void, thisArg?: any): void;
	on<T extends Observable = Placeholder>(event: 'creatingView', callback: (args: CreateViewEventData<T>) => void, thisArg?: any): void;
}
