import { topmost } from "tns-core-modules/ui/frame";

export function onTap() {
    topmost().navigate("font/font-awesome/issue-3654-2");
}
