import { topmost } from "tns-core-modules/ui/frame";

export function onTap() {
    topmost().navigate("issues/issue-2661-second-page");
}
