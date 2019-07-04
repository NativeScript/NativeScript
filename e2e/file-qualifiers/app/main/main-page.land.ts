import { topmost } from "tns-core-modules/ui/frame";
import { vm } from "./main-page-vm";

export function onNavigatingTo(args) {
    console.log("---> [LANDSCAPE] onNavigatingTo");
    args.object.page.bindingContext = vm;
}

export function tap(args) {
    console.log("---> [LANDSCAPE] tap");
}

export function navigate(args) {
    console.log("---> [LANDSCAPE] navigate");

    topmost().navigate("other/other-page");
}