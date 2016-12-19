import * as observable from "data/observable";
import * as trace from "trace";
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onLoaded(args: observable.EventData) {
    (<any>args.object).bindingContext = [0, 1];
}