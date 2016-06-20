import {EventData as ObservableEventData} from "data/observable";
import {Page} from "ui/page";

export function navigatedTo(args: ObservableEventData) {
    setTimeout(() => {
        __stopCPUProfiler("alabala");
        console.log(`Time: ${global.time() - global.startTime} ms`);
    });
}