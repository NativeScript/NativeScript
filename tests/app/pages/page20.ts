import * as observable from "@nativescript/core/data/observable";
import * as trace from "@nativescript/core/trace";
import { Button } from "@nativescript/core/ui/button";
import { Page } from "@nativescript/core/ui/page";
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onTap(args: observable.EventData) {
    var btn = <Button>args.object;
    (<Page>btn.page).showModal("tests/pages/page21", { context: null, closeCallback: null });
}
