import * as frame from "ui/frame";
import * as observable from "data/observable";

declare function __startCPUProfiler(name: string);

export function navigate(args: observable.EventData) {
    var tag = "" + args.object.get("tag");
    __startCPUProfiler("xml-performance-" + tag);
    frame.topmost().navigate({
        moduleName: tag,
    });
}