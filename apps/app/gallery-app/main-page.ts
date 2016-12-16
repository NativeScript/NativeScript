import * as observable from "data/observable";
import * as frame from "ui/frame";

export function itemTap(args: observable.EventData) {
    frame.topmost().navigate({
        moduleName: "gallery-app/" + args.object.get("tag"),
    });
}
