import {ShownModallyData} from "ui/page";

export function onShownModally(args: ShownModallyData) {
    args.context.shownModally = true;
    args.closeCallback("return value");
}