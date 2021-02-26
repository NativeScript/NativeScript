import { Enums } from '@nativescript/core';
import * as pageModule from '@nativescript/core/ui/page';
import * as model from './myview';

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = new model.ViewModel();
}

export function onOrientation(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	if (layout.orientation === Enums.Orientation.vertical) {
		layout.orientation = Enums.Orientation.horizontal;
	} else {
		layout.orientation = Enums.Orientation.vertical;
	}
}
