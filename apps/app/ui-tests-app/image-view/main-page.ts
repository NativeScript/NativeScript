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
    examples.set("roundbtn", "image-view/rounded-buttons");
    examples.set("roundimg", "image-view/rounded-images");
    examples.set("mode-matrix", "image-view/mode-matrix");
    examples.set("stretch-modes", "image-view/stretch-modes");
    examples.set("missing-image", "image-view/missing-image");
    examples.set("image-asset", "image-view/image-asset/image-asset");

    return examples;
}