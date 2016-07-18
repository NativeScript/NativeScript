import { EventData } from "data/observable";
import { MianPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();
    examples.set("actColor", "action-bar/color");
    examples.set("actBG", "action-bar/background");
    examples.set("actStyle", "action-bar/all");
    examples.set("actIcons", "action-bar/system-icons");
    examples.set("actView", "action-bar/action-view");
    examples.set("actionItemPosition", "action-bar/action-item-position");

    let viewModel = new SubMianPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMianPageViewModel extends MianPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}