import { topmost } from "ui/frame";

export function onTap() {
    topmost().navigate("ui-tests-app/issues/issue-2661-second");
}