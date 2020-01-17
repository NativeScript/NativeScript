import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { Frame } from "tns-core-modules/ui/frame";

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

export function onModalFrame(args: EventData) {
    const view = args.object as View;

    const frame = new Frame();
    frame.navigate("modal/modal-page");

    view.showModal(frame, {
        context: "context",
        closeCallback: () => console.log("home-page modal frame closed"),
        fullscreen: false
    });
}

export function onModalPage(args: EventData) {
    const view = args.object as View;
    view.showModal("modal/modal-page", {
        context: { frameless: true },
        closeCallback: () => console.log("home-page modal page closed"),
        fullscreen: false
    });
}
