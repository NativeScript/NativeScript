import * as application from "tns-core-modules/application";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { Frame } from "tns-core-modules/ui/frame";

export function onNavigatingTo(args: NavigatedData) {
    console.log("home-page onNavigatingTo");
}

export function onNavigatingFrom(args: NavigatedData) {
    console.log("home-page onNavigatingFrom");
}

export function onNavigatedTo(args: NavigatedData) {
    console.log("home-page onNavigatedTo");
}

export function onNavigatedFrom(args: NavigatedData) {
    console.log("home-page onNavigatedFrom");
}

export function onModalNoPage(args: EventData) {
    const view = args.object as View;

    view.showModal("modal-no-page/modal-no-page",
        "context",
        () => console.log("home-page modal frame closed"),
        false);
}

export function onModalFrame(args: EventData) {
    const view = args.object as View;

    const frame = new Frame();
    frame.navigate("modal/modal-page");

    view.showModal(frame,
        "context",
        () => console.log("home-page modal frame closed"),
        false);
}

export function onModalPage(args: EventData) {
    const view = args.object as View;
    view.showModal("modal/modal-page",
        { frameless: true },
        () => console.log("home-page modal page closed"),
        false);
}

export function onModalLayout(args: EventData) {
    const view = args.object as View;
    view.showModal("modal-layout/modal-layout-root",
        "context",
        () => console.log("home-page modal layout closed"),
        false);
}

export function onAndroidBackEvents(args: EventData) {
    const view = args.object as View;
    view.showModal(
        "android-back-button/android-back-button-page",
        null,
        () => console.log("android-back-button modal page layout closed"),
        true, true, true);
}

export function onModalTabView(args: EventData) {
    const fullscreen = false;
    const animated = false;
    const stretched = true;

    const view = args.object as View;
    view.showModal("modal-tab/modal-tab-root",
        { frameless: true },
        () => console.log("home-page modal tabview closed"),
        fullscreen,
        animated,
        stretched);
}

export function onNavigate(args: EventData) {
    const view = args.object as View;
    const page = view.page as Page;
    // In the layout root case for iOS, the page will be null
    if (page) {
        page.frame.navigate("second/second-page");
    }
}

export function onFrameRootViewReset() {
    application._resetRootView({ moduleName: "app-root" });
}

export function onTabRootViewReset() {
    application._resetRootView({ moduleName: "tab-root" });
}

export function onLayoutRootViewReset() {
    application._resetRootView({ moduleName: "layout-root" });
}