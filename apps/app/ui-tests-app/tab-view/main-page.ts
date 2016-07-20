import { EventData } from "data/observable";
import { MianPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();

    examples.set("tabColor", "tab-view/color");
    examples.set("tabBG", "tab-view/background");
    examples.set("tabTabsBG", "tab-view/tabsBackground");
    examples.set("tabSelected", "tab-view/selected");
    examples.set("tabStyle", "tab-view/all");

    let viewModel = new SubMianPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMianPageViewModel extends MianPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}