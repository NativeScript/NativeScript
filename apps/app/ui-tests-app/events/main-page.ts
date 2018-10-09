import { EventData } from "tns-core-modules/data/observable";
import { SubMainPageViewModel } from "../sub-main-page-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("gestures", "events/gestures");
    examples.set("touch", "events/touch-event");
    examples.set("pan", "events/pan-event");
    examples.set("swipe-passtrough", "events/swipe-event-passtrough");
    examples.set("handlers", "events/handlers");
    examples.set("console", "events/console");
    examples.set("i61", "events/i61");
    examples.set("i73", "events/i73");
    examples.set("i86", "events/i86");
    examples.set("layout changed", "events/layout-changed-event");

    return examples;
}
