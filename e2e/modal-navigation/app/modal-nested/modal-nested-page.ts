import { NavigatedData } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";

export function onNavigatingTo(args: NavigatedData) {
    console.log("NESTED modal-frame onNavigatingTo");
}

export function onNavigatingFrom(args: NavigatedData) {
    console.log("NESTED modal-frame onNavigatingFrom");
}

export function onNavigatedTo(args: NavigatedData) {
    console.log("NESTED modal-frame onNavigatedTo");
}

export function onNavigatedFrom(args: NavigatedData) {
    console.log("NESTED modal-frame onNavigatedFrom");
}

export function closeModal(args: EventData) {
    (args.object as View).closeModal();
}