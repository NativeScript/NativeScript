import { EventData } from "data/observable";
import { MainPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();
    
    examples.set("2911", "issues/issue-2911");
    examples.set("2674", "issues/issue-2674");
    examples.set("2942", "issues/issue-2942");
    examples.set("3007", "issues/issue-3007");
    examples.set("2661", "issues/issue-2661");
    examples.set("3113", "issues/issue-3113");
    examples.set("3164", "issues/issue-3164");
    examples.set("3175", "issues/issue-3175");
    examples.set("3211", "issues/issue-3211");
    examples.set("1639", "issues/issue-1639");
    examples.set("1657-ios", "issues/issue-1657-ios");

    let viewModel = new SubMainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}