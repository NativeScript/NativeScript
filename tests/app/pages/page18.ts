import * as frame from "ui/frame";
import * as observable from "data/observable";

import * as trace from "trace";
trace.setCategories("gestures");
trace.enable();

export function itemTap(args) {
    console.log("----- Item tapped: " + args.view.tag);

    frame.topmost().navigate({
        moduleName: "./pages/page5",
    });
}

export function itemLoaded(args: observable.EventData) {
    console.log("----- Item loaded: " + (<any>args.object).tag);
}

export function itemUnloaded(args: observable.EventData) {
    console.log("----- Item unloaded: " + (<any>args.object).tag);
}