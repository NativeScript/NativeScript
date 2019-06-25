import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";

export function onNavigatingTo(args: NavigatedData) {
    console.log("second-page onNavigatingTo");
}

export function onNavigatingFrom(args: NavigatedData) {
    console.log("second-page onNavigatingFrom");
}

export function onNavigatedTo(args: NavigatedData) {
    console.log("second-page onNavigatedTo");
}

export function onNavigatedFrom(args: NavigatedData) {
    console.log("second-page onNavigatedFrom");
}

export function onGoBack(args: EventData) {
    const view = args.object as View;
    const page = view.page as Page;
    page.frame.goBack();
}

export function onCloseModal(args: EventData) {
    (args.object as View).closeModal();
}
