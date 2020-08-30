import * as enums from '@nativescript/core/ui/enums';
import * as pageModule from '@nativescript/core/ui/page';
import * as model from './myview';

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = new model.ViewModelWithPercentage();
}

export function onOrientation(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	if (layout.orientation === enums.Orientation.vertical) {
		layout.orientation = enums.Orientation.horizontal;
	} else {
		layout.orientation = enums.Orientation.vertical;
	}
}
