import * as frame from "tns-core-modules/ui/frame";

export function buttonTap(args) { 
    frame.topmost().goBack();
}
