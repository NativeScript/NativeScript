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
    examples.set("full-screen-n-n", "nested-frames/full-screen-n-n");
    examples.set("full-screen-n-y", "nested-frames/full-screen-n-y");
    examples.set("full-screen-n-y-flat", "nested-frames/full-screen-n-y-flat");
    examples.set("full-screen-y-n", "nested-frames/full-screen-y-n");
    examples.set("full-screen-y-n-flat", "nested-frames/full-screen-y-n-flat");
    examples.set("full-screen-y-y", "nested-frames/full-screen-y-y");
    examples.set("full-screen-y-y-flat", "nested-frames/full-screen-y-y-flat");
    examples.set("mid-screen-n-n", "nested-frames/mid-screen-n-n");
    examples.set("mid-screen-n-y", "nested-frames/mid-screen-n-y");
    examples.set("mid-screen-n-y-flat", "nested-frames/mid-screen-n-y-flat");
    examples.set("mid-screen-y-n", "nested-frames/mid-screen-y-n");
    examples.set("mid-screen-y-n-flat", "nested-frames/mid-screen-y-n-flat");
    examples.set("mid-screen-y-y", "nested-frames/mid-screen-y-y");
    examples.set("mid-screen-y-y-flat", "nested-frames/mid-screen-y-y-flat");
    examples.set("tab-y-y", "nested-frames/tab-y-y");
    examples.set("tab-y-y-flat", "nested-frames/tab-y-y-flat");
    examples.set("tab-n-y", "nested-frames/tab-n-y");
    examples.set("tab-n-y-flat", "nested-frames/tab-n-y-flat");
    examples.set("tab-y-n", "nested-frames/tab-y-n");
    examples.set("tab-y-n-flat", "nested-frames/tab-y-n-flat");
    examples.set("tab-n-n", "nested-frames/tab-n-n");

    return examples;
}