import { View, CustomLayoutView, AddChildFromBuilder } from '../core/view';

/**
 *
 * @nsView ContentView
 */
export declare class ContentView extends CustomLayoutView implements AddChildFromBuilder {
	/**
	 * Gets or sets the single child of the view.
	 *
	 * @nsProperty
	 */
	content: View;
	layoutView(): View;
	_addChildFromBuilder(name: string, value: any): void;
}
