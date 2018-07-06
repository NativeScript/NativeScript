import { topmost } from "tns-core-modules/ui/frame";

export function navigate(args) {
    topmost().navigate("ui-tests-app/action-bar/clean");
}
