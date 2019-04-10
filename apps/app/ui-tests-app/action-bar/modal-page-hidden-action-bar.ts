import { ShownModallyData } from "tns-core-modules/ui/core/view";

let closeCallback: Function;

export function onShownModally(args: ShownModallyData) {
    closeCallback = args.closeCallback;
}

export function onTap() {
    closeCallback("sample text\n");
}