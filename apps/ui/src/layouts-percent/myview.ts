import { View, PercentLength } from '@nativescript/core';
import { ViewModelBase } from '../layouts/myview-base';

export class ViewModelWithPercentage extends ViewModelBase {
	constructor() {
		super();
	}

	// View properties
	public onWidthHeight(args: { eventName: string; object: any }): void {
		let view = args.object;
		if (!PercentLength.equals(view.marginLeft, { value: 0.5, unit: '%' })) {
			super.setWidthHeight(view, '50%', '50%');
		} else {
			super.setWidthHeight(view, '75%', '75%');
		}
	}

	public onMargins(args: { eventName: string; object: any }): void {
		let view = args.object;
		if (!PercentLength.equals(view.marginLeft, { value: 0.1, unit: '%' })) {
			super.setMargins(view, '10%', '10%', '10%', '10%');
		} else {
			super.setMargins(view, 0, 0, 0, 0);
		}
	}

	public onMinWidthMinHeight(args: { eventName: string; object: any }): void {
		let view = args.object;
		if (!PercentLength.equals(view.marginLeft, 105)) {
			super.setMinWidthHeight(view, 105, 55);
		} else {
			super.setMinWidthHeight(view, 0, 0);
		}
	}

	public onAllProperties(args: { eventName: string; object: any }): void {
		let child: any;
		let layout: any = args.object.parent;

		// WidthHeight
		child = <View>layout.getViewById('widthHeight');
		if (!PercentLength.equals((<any>child).width, { value: 0.5, unit: '%' })) {
			super.setWidthHeight(child, '50%', '50%');
		} else {
			super.setWidthHeight(child, '75%', '75%');
		}

		// MinWidthMinHeight
		child = <View>layout.getViewById('minWidthMinHeight');
		if (child.minWidth !== 105) {
			super.setMinWidthHeight(child, 105, 55);
		} else {
			super.setMinWidthHeight(child, 0, 0);
		}

		// Margins
		child = layout.getViewById('margins');
		if (!PercentLength.equals(child.marginLeft, { value: 0.1, unit: '%' })) {
			super.setMargins(child, '10%', '10%', '10%', '10%');
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
