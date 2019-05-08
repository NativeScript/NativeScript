import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { Frame, ShownModallyData } from "tns-core-modules/ui/frame";
import { fromObject } from "tns-core-modules/data/observable";
import { confirm } from "tns-core-modules/ui/dialogs";

export function onShowingModally(args: ShownModallyData) {
    console.log("modal-page showingModally");

    let navigationVisibility = "visible";
    if (args.context.frameless) {
        navigationVisibility = "collapse";
    }

    (<any>args.object).bindingContext = fromObject({ navigationVisibility });
}

export function onLoaded(args) {
    console.log("modal-page loaded");
}

export function onNavigatingTo(args: NavigatedData) {
    console.log("modal-page onNavigatingTo");
}

export function onNavigatingFrom(args: NavigatedData) {
    console.log("modal-page onNavigatingFrom");
}

export function onNavigatedTo(args: NavigatedData) {
    console.log("modal-page onNavigatedTo");
}

export function onNavigatedFrom(args: NavigatedData) {
    console.log("modal-page onNavigatedFrom");
}

export function closeModal(args: EventData) {
    (args.object as View).closeModal();
}

export function showNestedModalFrame(args: EventData) {
    const view = args.object as View;

    const frame = new Frame();
    frame.navigate("modal-nested/modal-nested-page");

    view.showModal(frame,
        "nested-context",
        () => console.log("modal frame nested closed"),
        false);
}

export function showNestedModalPage(args: EventData) {
    const view = args.object as View;

    view.showModal("modal-nested/modal-nested-page",
        "nested-context",
        () => console.log("modal page nested closed"),
        false);
}

export function onNavigate(args: EventData) {
    const view = args.object as View;
    const page = view.page as Page;
    page.frame.navigate("modal-second/modal-second-page");
}

export function showDialog(args: EventData) {
    let options = {
        title: "Dialog",
        message: "Message",
        okButtonText: "Yes",
        cancelButtonText: "No"

    }

    confirm(options).then((result: boolean) => {
        console.log(result);
    })
}