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
    examples.set("actColor", "action-bar/color");
    examples.set("actBG", "action-bar/background");
    examples.set("actStyle", "action-bar/all");
    examples.set("actIcons", "action-bar/system-icons");
    examples.set("actView", "action-bar/action-view");
    examples.set("actionItemPosition", "action-bar/action-item-position");
    examples.set("actBGCss", "action-bar/background-css");
    examples.set("actTransparentBgCss", "action-bar/transparent-bg-css");
    examples.set("modalHiddenActBar", "action-bar/modal-test-hidden-action-bar");
    examples.set("modalShownActBar", "action-bar/modal-test-with-action-bar");
    examples.set("flat", "action-bar/flat");
    examples.set("flat-tab", "action-bar/flat-tab");
    examples.set("flat-scrollview", "action-bar/flat-scrollview");

    return examples;
}