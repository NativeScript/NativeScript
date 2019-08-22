import { ShownModallyData } from "tns-core-modules/ui/page";

let closeCallback: Function;

export function onShownModally(args: ShownModallyData) {
    closeCallback = args.closeCallback;
}

export function onTap() {
    closeCallback("sample text\n");
}
