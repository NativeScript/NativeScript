import {ShownModallyData} from "ui/page";
import TKUnit = require("../../TKUnit");

export function onShownModally(args: ShownModallyData) {
    TKUnit.wait(0.100);
    args.context.shownModally = true;
    args.closeCallback("return value");
}