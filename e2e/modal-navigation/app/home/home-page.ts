import * as application from "tns-core-modules/application";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { View, EventData, ShowModalOptions } from "tns-core-modules/ui/core/view";
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

    view.showModal("modal-no-page/modal-no-page", {
        context: "context",
        closeCallback: () => console.log("home-page modal frame closed"),
        fullscreen: false
    });

    view.showModal("modal-no-page/modal-no-page", {
        context: "context",
        closeCallback: () => console.log("home-page modal frame closed"),
        fullscreen: false
    });
}

export function onPopoverModal(args: EventData) {
    const view = args.object as View;
    let options: ShowModalOptions = {
        context: "context",
        closeCallback: () => console.log("home-page modal popover frame closed"),
        animated: false,
        ios: {
            presentationStyle: UIModalPresentationStyle.Popover
        }
    };

    view.showModal("modal-no-page/modal-no-page", options);
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

export function onModalLayout(args: EventData) {
    const view = args.object as View;
    view.showModal("modal-layout/modal-layout-root", {
        context: "context",
        closeCallback: () => console.log("home-page modal layout closed"),
        fullscreen: false
    });
}

export function onAndroidBackEvents(args: EventData) {
    const view = args.object as View;
    view.showModal("android-back-button/android-back-button-page", {
        context: null,
        closeCallback: () => console.log("android-back-button modal page layout closed"),
        fullscreen: true,
        animated: true,
        stretched: true
    });
}

export function onModalTabView(args: EventData) {
    const view = args.object as View;
    view.showModal("modal-tab/modal-tab-root", {
        context: { frameless: true },
        closeCallback: () => console.log("home-page modal tabview closed"),
        fullscreen: false,
        animated: false,
        stretched: true
    });
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