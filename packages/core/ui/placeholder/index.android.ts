import { CreateViewEventData } from './placeholder-common';
import { View, CSSType } from '../core/view';
import { EventData, Observable } from '../../data/observable';

export * from './placeholder-common';

@CSSType('Placeholder')
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

		return <android.view.View>args.view;
	}
}
export interface Placeholder {
	on<T extends Observable = Placeholder>(eventNames: string, callback: (args: EventData<T>) => void, thisArg?: any): void;
	on<T extends Observable = Placeholder>(event: 'creatingView', callback: (args: CreateViewEventData<T>) => void, thisArg?: any): void;
}
