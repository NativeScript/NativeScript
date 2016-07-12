import {EventData as ObservableEventData} from "data/observable";

export function navigatedTo(args: ObservableEventData) {
    setTimeout(() => {
        console.log(`Time: ${global.time() - global.startTime} ms`);
    });
}