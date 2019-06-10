import { topmost } from "tns-core-modules/ui/frame";

export function onTap() {
    topmost().navigate("ui-tests-app/font/font-awesome/issue-3654-2");
}
