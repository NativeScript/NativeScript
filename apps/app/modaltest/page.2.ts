import { View, EventData, ShownModallyData } from "tns-core-modules/ui/core/view";

var x = 0;

export function tenGoBacks(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    const frame = page.frame;

    x = 10;
    while (x--) {
        console.log(`Can go Back: ${frame.canGoBack()}`);
        frame.goBack();
    }
}
export function onTap(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    let context = page.bindingContext || 0;
    page.frame.navigate({ moduleName: "modaltest/page.2", bindingContext: ++context, transition: { name: "fade", duration: 1000 } });
}

export function onBack(args: EventData) {
    const view = args.object as View;
    const page = view.page;
    page.frame.goBack();
}

export function closeModal(args: EventData) {
    (args.object as View).closeModal();
}

let modalContext = 0;
export function showModal(args: EventData) {
    (args.object as View).showModal("modaltest/page.2", ++modalContext, function () {
        console.log("Closed Modal: " + (args.object as View).bindingContext);
    });
}

export function showingModally(args: ShownModallyData) {
    (args.object as View).bindingContext = args.context;
}

export function onLivesync() {
    global.__onLiveSyncCore();
}