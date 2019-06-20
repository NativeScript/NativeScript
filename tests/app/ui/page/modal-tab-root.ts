import { ShownModallyData } from "tns-core-modules/ui/core/view";
import { TabView } from "tns-core-modules/ui/tab-view/tab-view";
import * as TKUnit from "../../tk-unit";
import { stack } from "tns-core-modules/ui/frame";
import { isIOS } from "tns-core-modules/platform"

export function onShownModally(args: ShownModallyData) {
    const tabView = <TabView>args.object;
    TKUnit.assertNotNull(tabView);
    if (args.context) {
        args.context.shownModally = true;
    }

    const hostFrame = stack()[0];
    TKUnit.assertNotNull(hostFrame, "Host frame should not be null");
    TKUnit.assertEqual(hostFrame.currentPage.modal, tabView, "hostFrame.currentPage.modal should be equal to the tabView instance on tabView.shownModally event handler.");

    // shownModally raised after page.NavigatedTo on iOS
    if (isIOS) {
        args.closeCallback("return value");
    }
}