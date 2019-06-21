import * as frame from "tns-core-modules/ui/frame";

export function onNavBtnTap(args) {
    frame.topmost().goBack();
}