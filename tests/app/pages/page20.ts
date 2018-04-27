import * as observable from "tns-core-modules/data/observable";
import * as trace from "tns-core-modules/trace";
import { Button } from "tns-core-modules/ui/button";
import { Page } from "tns-core-modules/ui/page";
trace.addCategories(trace.categories.Layout);
trace.enable();

export function onTap(args: observable.EventData) {
    var btn = <Button>args.object;
    (<Page>btn.page).showModal("tests/pages/page21", null, null);
}
