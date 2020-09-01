import * as observable from '@nativescript/core/data/observable';
import { Trace } from '@nativescript/core';
Trace.addCategories(Trace.categories.Layout);
Trace.enable();

export function onLoaded(args: observable.EventData) {
	(<any>args.object).bindingContext = [0, 1];
}
