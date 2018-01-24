
import { EventData } from "tns-core-modules/data/observable";
import { Frame } from "tns-core-modules/ui/frame";

export function pageLoaded(args: EventData) {
    (<Frame>args.object).navigate("ui-tests-app/main-page");
}