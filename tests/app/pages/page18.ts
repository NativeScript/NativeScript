import { Frame } from "@nativescript/core/ui/frame";
import * as observable from "@nativescript/core/data/observable";

import * as trace from "@nativescript/core/trace";
trace.setCategories("gestures");
trace.enable();

export function itemTap(args) {
    console.log("----- Item tapped: " + args.view.tag);

    Frame.topmost().navigate({
        moduleName: "./pages/page5",
    });
}

export function itemLoaded(args: observable.EventData) {
    console.log("----- Item loaded: " + (<any>args.object).tag);
}

export function itemUnloaded(args: observable.EventData) {
    console.log("----- Item unloaded: " + (<any>args.object).tag);
}
