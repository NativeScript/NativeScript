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
    examples.set("bottom-navigation", "tabs/default");
    examples.set("issue-5470", "bottom-navigation/issue-5470");
    examples.set("background-color", "bottom-navigation/background-color");
    examples.set("color", "bottom-navigation/color");
    examples.set("icon-title-placement", "bottom-navigation/icon-title-placement");
    examples.set("icon-change", "bottom-navigation/icon-change");
    examples.set("swipe-enabled", "tabs/swipe-enabled");
    examples.set("tabs-position", "tabs/tabs-position");
    
    return examples;
}
