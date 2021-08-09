import * as pageModule from '@nativescript/core/ui/page';
import * as model from './myview';

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = new model.ViewModel();
}

export function onStretchLastChild(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	if (layout.stretchLastChild === true) {
		layout.stretchLastChild = false;
	} else {
		layout.stretchLastChild = true;
	}
}
