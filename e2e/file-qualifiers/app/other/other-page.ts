import { topmost } from "tns-core-modules/ui/frame";

export function onNavigatedTo(args) {
    console.log("---> [DEFAULT other] onNavigatedTo");
}

export function tap(args) {
    console.log("---> [DEFAULT other] tap");
}

export function navigate(args) {
    console.log("---> [DEFAULT other] navigate");

    topmost().navigate("main/main-page");
}
