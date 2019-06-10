import { topmost } from "tns-core-modules/ui/frame";

export function onTap(args) {
    topmost().goBack();
}
