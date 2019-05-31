import * as observable from "tns-core-modules/data/observable";
import * as trace from "tns-core-modules/trace";
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onLoaded(args: observable.EventData) {
    (<any>args.object).bindingContext = [0, 1];
}
