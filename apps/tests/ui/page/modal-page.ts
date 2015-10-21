import {ShownModallyData} from "ui/page";
import TKUnit = require("../../TKUnit");
import frame = require("ui/frame");
import page = require("ui/page");

export function onShownModally(args: ShownModallyData) {
    TKUnit.wait(0.100);
    var modalPage = <page.Page>args.object;
    args.context.shownModally = true;
    TKUnit.assert(frame.topmost().currentPage.modal = modalPage, "frame.topmost().currentPage.modal should be equal to the page instance on page.shownModally event handler.");
    args.closeCallback("return value");
}