import { topmost } from "tns-core-modules/ui/frame";

export function onTap() {
    topmost().goBack();
}
