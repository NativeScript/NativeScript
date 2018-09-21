import { android as androidApp, AndroidActivityBackPressedEventData } from "tns-core-modules/application";
import { fromObject, Observable } from "tns-core-modules/data/observable"

let context: Observable;
function activityBackPressedCallback(args: AndroidActivityBackPressedEventData) {
    if (context && context.get("shouldCancel")) {
        context.set("shouldCancel", false);
        context.set("message", "Back-pressed canceled!");
        args.cancel = true;
    }
}
export function onLoaded(args) {
    console.log("back-button modal test loaded");
    context = fromObject({
        message: "First back-press will be canceled",
        shouldCancel: true
    });

    args.object.bindingContext = context;

    if (androidApp) {
        androidApp.on("activityBackPressed", activityBackPressedCallback);
    }
}

export function onUnloaded(args) {
    console.log("back-button modal test unloaded");

    if (androidApp) {
        androidApp.off("activityBackPressed", activityBackPressedCallback);
    }
}
