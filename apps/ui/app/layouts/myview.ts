import { View } from '@nativescript/core';
import { ViewModelBase } from './myview-base';

export class ViewModel extends ViewModelBase {
	constructor() {
		super();
	}

	// View properties
	public onWidthHeight(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		if (view.width !== 30) {
			super.setWidthHeight(view, 105, 55);
		} else {
			super.setWidthHeight(view, 0, 0);
		}
	}

	public onMinWidthMinHeight(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		if (view.minWidth !== 105) {
			super.setMinWidthHeight(view, 105, 55);
		} else {
			super.setMinWidthHeight(view, 0, 0);
		}
	}

	public onMargins(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		if (view.marginLeft !== 5) {
			super.setMargins(view, 5, 5, 5, 5);
		} else {
			super.setMargins(view, 0, 0, 0, 0);
		}
	}

	public onAllProperties(args: { eventName: string; object: any }): void {
		let child;
		let layout = args.object.parent;

		// WidthHeight
		child = layout.getViewById('widthHeight');
		if (child.width !== 30) {
			super.setWidthHeight(child, 30, 50);
		} else {
			super.setWidthHeight(child, Number.NaN, Number.NaN);
		}

		// MinWidthMinHeight
		child = layout.getViewById('minWidthMinHeight');
		if (child.minWidth !== 105) {
			super.setMinWidthHeight(child, 105, 55);
		} else {
			super.setMinWidthHeight(child, 0, 0);
		}
		// Margins
		child = layout.getViewById('margins');
		if (child.marginLeft !== 5) {
			super.setMargins(child, 5, 5, 5, 5);
		} else {
			super.setMargins(child, 0, 0, 0, 0);
		}

		// Alignments
		child = layout.getViewById('alignments');
		super.setAllPositioningProperties(child);
		super.toggleVisibility(child);

		// Paddings
		if (layout.paddingLeft !== 5) {
			super.setPaddings(layout, 5, 5, 5, 5);
		} else {
			super.setPaddings(layout, 0, 0, 0, 0);
		}
	}
}
