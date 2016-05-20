import {topmost} from "ui/frame";
import TKUnit = require("../../TKUnit");
import {Page, ShownModallyData} from "ui/page";

export var modalPage: Page;
export function onShowingModally(args) {
    modalPage = <Page>args.object;
    args.object.showingModally = true;
}

export function onShownModally(args: ShownModallyData) {
    let page = <Page>args.object;
    TKUnit.assertNotNull(page);
    if (args.context) {
        args.context.shownModally = true;
    }

    TKUnit.assertEqual(topmost().currentPage.modal, page, "frame.topmost().currentPage.modal should be equal to the page instance on page.shownModally event handler.");
    args.closeCallback("return value");
}