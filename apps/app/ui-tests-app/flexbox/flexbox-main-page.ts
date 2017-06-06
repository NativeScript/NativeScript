import { EventData } from "tns-core-modules/data/observable";
import { TestPageMainViewModel } from "../test-page-main-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new FlexboxMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("flexboxall", "flexbox/flexbox");
    examples.set("flexboxcss", "flexbox/flexbox-css");
    examples.set("flexboxdemo", "flexbox/flexbox-demo");
    examples.set("flexrepeat", "flexbox/flexbox-repeater");
    examples.set("flex-perf", "flexbox/flexbox-perf-comparison");
    examples.set("flexbox-4143", "flexbox/flexbox-4143");

    return examples;
}

export class FlexboxMainPageViewModel extends TestPageMainViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}