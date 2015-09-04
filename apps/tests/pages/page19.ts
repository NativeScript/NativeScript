import observable = require("data/observable");
import trace = require("trace");
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onLoaded(args: observable.EventData) {
    (<any>args.object).bindingContext = [0, 1];
}