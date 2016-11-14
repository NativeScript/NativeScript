import { EventData } from "data/observable";
import { MainPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";
import { getViewById } from "ui/core/view"

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let wrapLayout = <WrapLayout>getViewById(page, "wrapLayout");
    let examples = new Map<string, string>();

    examples.set("flexboxall", "flexbox/flexbox");
    examples.set("flexrepeat", "flexbox/flexbox-repeater");
    examples.set("flex-perf", "flexbox/flexbox-perf-comparison");

    let viewModel = new FlexboxMainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class FlexboxMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}