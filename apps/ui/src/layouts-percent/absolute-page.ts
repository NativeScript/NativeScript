import * as pageModule from '@nativescript/core/ui/page';
import * as absoluteLayout from '@nativescript/core/ui/layouts/absolute-layout';
import * as model from './myview';

var count = 0;

export function onLoaded(args: { eventName: string; object: any }) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = new model.ViewModelWithPercentage();
}

export function onSetLeftSetTop(args: { eventName: string; object: any }) {
	var layout = args.object.parent;
	var child = layout.getViewById('setLeftSetTop');
	if (++count % 2 === 1) {
		absoluteLayout.AbsoluteLayout.setLeft(child, 175);
		absoluteLayout.AbsoluteLayout.setTop(child, 375);
	} else {
		absoluteLayout.AbsoluteLayout.setLeft(child, 0);
		absoluteLayout.AbsoluteLayout.setTop(child, 400);
	}
}
