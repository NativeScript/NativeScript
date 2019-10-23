import * as observable from "@nativescript/core/data/observable";
import * as trace from "@nativescript/core/trace";
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onLoaded(args: observable.EventData) {
    (<any>args.object).bindingContext = [0, 1];
}
