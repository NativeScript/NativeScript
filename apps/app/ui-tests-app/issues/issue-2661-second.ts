import { topmost } from "ui/frame";

export function onTap() {
    topmost().goBack();
}