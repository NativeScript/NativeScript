import { View, EventData } from "tns-core-modules/ui/core/view";

const colors = ['red', 'orange', 'magenta'];
let x = 0;

export function onLoaded(args) {
    // args.object.backgroundColor = colors[++x % 3];
}

export function onLiveSync() {
    global.__onLiveSyncCore();
}

export function pageLoaded(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    console.log("Page loaded: " + page + ", isLoaded: " + page.isLoaded);
    console.log("Frame: " + page.frame + ", currentPage: " + page.frame.currentPage);
}

export function onTap(args) {
    const view = args.object as View;
    const page = view.page;
    let context = page.bindingContext || 0;
    page.frame.navigate({ moduleName: "modaltest/page.2", bindingContext: ++context, transition: { name: "fade", duration: 1000 } });
}

export function tenGoBacks(args) {
    const view = args.object as View;
    const page = view.page;
    const frame = page.frame;
    
    let context = page.bindingContext || 0;
    let x = 4;
    while (x--) {
        frame.navigate({ moduleName: "modaltest/page.2", bindingContext: ++context, transition: { name: "fade", duration: 1000 } });
    }

    x = 4;
    while (x--) {
        frame.goBack();
    }
}

export function closeModal(args: EventData) {
    (args.object as View).closeModal()
}

export function navigateToFrame(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    const frame = page.frame;
    frame.navigate("modaltest/modal-frame");
}

export function navigateToPageWithFrame(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    const frame = page.frame;
    frame.navigate("modaltest/modal-frame.1");
}

export function onModalFrame(args: EventData) {
    const view = args.object as View;
    view.showModal("modaltest/modal-frame", "some context", undefined, false);
}