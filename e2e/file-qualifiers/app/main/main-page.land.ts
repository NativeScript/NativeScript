import { topmost } from "tns-core-modules/ui/frame";

export function onNavigatedTo(args) {
    console.log("---> [LANDSCAPE] onNavigatedTo");
}

export function tap(args) {
    console.log("---> [DEFAULT] tap");
}

export function navigate(args) {
    console.log("---> [DEFAULT] navigate");

    topmost().navigate("other/other-page");
}