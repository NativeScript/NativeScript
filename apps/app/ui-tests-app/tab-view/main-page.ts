import { EventData } from "tns-core-modules/data/observable";
import { TestPageMainViewModel } from "../test-page-main-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();    
    examples.set("tabColor", "tab-view/color");
    examples.set("tabBG", "tab-view/background");
    examples.set("tabTabsBG", "tab-view/tabsBackground");
    examples.set("tabSelected", "tab-view/selected");
    examples.set("tabStyle", "tab-view/all");
    examples.set("tabmore", "tab-view/tab-view-more");
    examples.set("tabViewCss", "tab-view/tab-view-css");
    examples.set("tab-view-icons", "tab-view/tab-view-icon");
    examples.set("text-transform", "tab-view/text-transform");
    return examples;
}

export class SubMainPageViewModel extends TestPageMainViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}
