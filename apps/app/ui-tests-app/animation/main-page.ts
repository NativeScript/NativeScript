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
    examples.set("animation-curves", "animation/animation-curves");
    examples.set("animation-army-100", "animation/animation-army-100");
    examples.set("height-basic", "animation/height-basic");
    examples.set("layout-stack-height", "animation/layout-stack-height");
    examples.set("effect-summary-details", "animation/effect-summary-details");
    return examples;
}
