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
    examples.set("absolute", "layouts/absolute");
    examples.set("dock", "layouts/dock");
    examples.set("grid", "layouts/grid");
    examples.set("stack", "layouts/stack");
    examples.set("wrap", "layouts/wrap");
    examples.set("pabsolute", "layouts-percent/absolute");
    examples.set("pdock", "layouts-percent/dock");
    examples.set("pgrid", "layouts-percent/grid");
    examples.set("pstack", "layouts-percent/stack");
    examples.set("pwrap", "layouts-percent/wrap");
    examples.set("passThroughParent", "layouts/passThroughParent");
    examples.set("stacklayout-6059", "layouts/stacklayout-6059");
    examples.set("safe-area", "layouts/safe-area");

    return examples;
}