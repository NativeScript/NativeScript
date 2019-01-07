import { EventData as ObservableEventData } from "tns-core-modules/data/observable";

export function navigatedTo(args: ObservableEventData) {
    setTimeout(() => {
        console.log(`Time: ${(<any>global).time() - (<any>global).startTime} ms`);
    });
}
