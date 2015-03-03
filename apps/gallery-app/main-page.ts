import observable = require("data/observable");
import frame = require("ui/frame");

export function itemTap(args: observable.EventData) {
    frame.topmost().navigate({
        moduleName: "app/" + args.object.get("tag"),
    });
}
 