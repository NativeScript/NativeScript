import { Frame } from "@nativescript/core/ui/frame";
import * as TKUnit from "../../tk-unit";
import { Page, ShownModallyData } from "@nativescript/core/ui/page";

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

    TKUnit.assertEqual(Frame.topmost().currentPage.modal, page, "Frame.topmost().currentPage.modal should be equal to the page instance on page.shownModally event handler.");
    args.closeCallback("return value");
}
