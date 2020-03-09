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
    examples.set("scrolling-and-sizing", "scroll-view/scrolling-and-sizing-page");
    examples.set("safe-area-root-element", "scroll-view/safe-area-root-element-page");
    examples.set("safe-area-sub-element", "scroll-view/safe-area-sub-element-page");
    examples.set("safe-area-images", "scroll-view/safe-area-images-page");
    examples.set("safe-area-images-overflow", "scroll-view/safe-area-images-overflow-page");
    examples.set("layout-outside-scroll", "scroll-view/layout-outside-scroll-page");

    return examples;
}
