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
    examples.set("3714", "issues/issue-3714");
    examples.set("1657-ios", "issues/issue-1657-ios");
    examples.set("tabview-with-scrollview_4022", "issues/tabview-with-scrollview_4022");
    examples.set("3354-ios", "issues/issue-3354");
    examples.set("4450", "issues/issue-4450");
    examples.set("5274", "issues/issue-5274");

    return examples;
}