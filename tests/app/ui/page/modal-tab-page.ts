import { NavigatedData } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import * as TKUnit from "../../TKUnit";
import { stack } from "tns-core-modules/ui/frame";
import { isAndroid } from "tns-core-modules/platform";

export function onNavigatedTo(args: NavigatedData) {
    TKUnit.assertEqual(stack().length, 2, "Host and tab modal frame should be instantiated at this point!");
    // shownModally raised after page.NavigatedTo on iOS so we close modal there
    if (isAndroid) {
        (args.object as View).closeModal();
    }
}
