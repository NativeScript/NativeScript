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
    examples.set("bottom-navigation", "bottom-navigation/bottom-navigation-page");
    examples.set("issue-5470", "bottom-navigation/issue-5470-page");
    examples.set("background-color", "bottom-navigation/background-color-page");
    examples.set("color", "bottom-navigation/color-page");
    examples.set("icon-title-placement", "bottom-navigation/icon-title-placement-page");
    examples.set("icon-change", "bottom-navigation/icon-change-page");
    
    return examples;
}
