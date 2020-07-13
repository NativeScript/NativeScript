import { View, CustomLayoutView, AddChildFromBuilder } from '../core/view';

export declare class ContentView extends CustomLayoutView implements AddChildFromBuilder {
	content: View;
	layoutView(): View;
	_addChildFromBuilder(name: string, value: any): void;
}
