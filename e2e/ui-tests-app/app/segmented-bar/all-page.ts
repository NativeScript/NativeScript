import * as frame from "tns-core-modules/ui/frame";

export function navigate() {
    frame.topmost().navigate("segmented-bar/clean-page");
}
