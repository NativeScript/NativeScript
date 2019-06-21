import * as frame from "tns-core-modules/ui/frame";
import { EventData } from "tns-core-modules/ui/frame";
import { Button } from "tns-core-modules/ui/button";
import { ActionBar } from "tns-core-modules/ui/action-bar";

const iconModes = ["automatic", "alwaysOriginal", "alwaysTemplate", undefined];

export function navigate() {
    frame.topmost().navigate("action-bar/clean-page");
}

export function onChangeRenderingMode(args: EventData) {
    const button = <Button>args.object;
    const actionBar = <ActionBar>button.page.actionBar
    actionBar.iosIconRenderingMode = <"automatic" | "alwaysOriginal" | "alwaysTemplate">iconModes[(iconModes.indexOf(actionBar.iosIconRenderingMode) + 1) % iconModes.length];
    button.text = "" + actionBar.iosIconRenderingMode;
}
