import { topmost } from "tns-core-modules/ui/frame";

export function onNavigatedTo(args) {
    console.log("---> [LANDSCAPE other] onNavigatedTo");
}

export function tap(args) {
    console.log("---> [LANDSCAPE other] tap");
}

export function navigate(args) {
    console.log("---> [LANDSCAPE other] navigate");

    topmost().navigate("main/main-page");
}
