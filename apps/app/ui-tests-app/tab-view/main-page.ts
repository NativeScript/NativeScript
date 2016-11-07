import { EventData } from "data/observable";
import { MainPageViewModel } from "../mainPage";
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
    examples.set("tabmore", "tab-view/tab-view-more");
    examples.set("tabViewCss", "tab-view/tab-view-css");
    examples.set("tab-view-icons", "tab-view/tab-view-icon");

    let viewModel = new SubMainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}