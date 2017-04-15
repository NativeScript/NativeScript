import * as observable from "tns-core-modules/data/observable";
import * as frame from "tns-core-modules/ui/frame";

export function itemTap(args: observable.EventData) {
    frame.topmost().navigate({
        moduleName: "gallery-app/" + args.object.get("tag"),
    });
}
