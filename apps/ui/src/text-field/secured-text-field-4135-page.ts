import * as observable from '@nativescript/core/data/observable';

export function pageLoaded(args) {
	const page = args.object;
	const textFieldSecured = page.getViewById('textFieldSecured');
	textFieldSecured.secure = true;

	const obj = new observable.Observable();
	obj.set('textProperty', 'text');
	page.bindingContext = obj;
}
