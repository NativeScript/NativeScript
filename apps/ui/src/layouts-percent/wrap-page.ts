import { CoreTypes } from '@nativescript/core';
import * as pageModule from '@nativescript/core/ui/page';
import * as model from './myview';

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = new model.ViewModelWithPercentage();
}

export function onOrientation(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	if (layout.orientation === CoreTypes.Orientation.vertical) {
		layout.orientation = CoreTypes.Orientation.horizontal;
	} else {
		layout.orientation = CoreTypes.Orientation.vertical;
	}
}

export function onItemWidthItemHeight(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	layout.itemWidth = 100;
	layout.itemHeight = 100;
}
