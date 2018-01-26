import { View, EventData } from "tns-core-modules/ui/core/view";

export function onNavigatingTo(args: EventData) {
    const page = args.object;
    console.log("onNavigatingTo");
}

export function navigate(args: EventData) {
    console.log("navigate");
    (args.object as View).page.frame.navigate("modaltest/page.1");
}

export function onModalTab(args: EventData) {
    const view = args.object as View;
    view.showModal("modaltest/modal-tab", "context", closeModal, false);
}

export function onModalFrame(args: EventData) {
    const view = args.object as View;
    view.showModal("modaltest/modal-frame", "context", closeModal, false);
}

export function onTap3(args: EventData) {
    const page = (args.object as View).page;
    page.actionBar.titleView.requestLayout();
}

function closeModal() {
    console.log('closeModal Called');
}

export function sync(args: EventData) {
    global.__onLiveSyncCore();
}