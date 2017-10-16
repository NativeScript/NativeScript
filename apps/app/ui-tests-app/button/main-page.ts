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
    examples.set("btn-wrap-text-alignment-4266", "button/btn-wrap-text-alignment-4266");
    examples.set("button-border", "button/button-border");
    examples.set("styles", "button/styles");
    examples.set("background", "button/background");
    examples.set("border-playground","button/border-playground");
    examples.set("issue-4287","button/issue-4287");
    examples.set("issue-4385","button/issue-4385");
    examples.set("highlight-4740","button/highlight-4740/highlight-4740");
    return examples;
}