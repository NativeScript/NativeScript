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
    examples.set("formatted", "css/decoration-transform-formattedtext");
    examples.set("radius", "css/radius");
    examples.set("spacing", "css/letter-spacing");
    examples.set("line-height", "css/line-height");
    examples.set("decoration", "css/text-decoration");
    examples.set("transform", "css/text-transform");
    examples.set("whitespace", "css/white-space");
    examples.set("progress-switch", "css/progress-switch");
    examples.set("zindex", "css/zindex");
    examples.set("clipPath", "css/clip-path");
    examples.set("clipPathInset", "css/clip-path-inset");
    examples.set("padding", "css/padding");
    examples.set("pixels", "css/pixels");
    examples.set("label-background-image", "css/label-background-image");
    examples.set("transform-decoration-color", "css/transform-decoration-color");
    examples.set("layout-border", "css/layout-border");
    examples.set("label-border", "css/label-border");
    examples.set("text-view-border", "css/text-view-border");
    examples.set("image-border", "css/image-border");
    examples.set("layouts-border-overlap", "css/layouts-border-overlap");
    examples.set("measure-tests", "css/measure-tests");
    examples.set("all-uniform-border", "css/all-uniform-border");
    examples.set("all-non-uniform-border", "css/all-non-uniform-border");
    examples.set("margins-paddings-with-percentage", "css/margins-paddings-with-percentage");
    examples.set("padding-and-border", "css/padding-and-border");
    examples.set("combinators", "css/combinators");
    examples.set("styled-formatted-text", "css/styled-formatted-text");
    examples.set("non-uniform-radius", "css/non-uniform-radius");
    examples.set("missing-background-image", "css/missing-background-image");
    examples.set("background-shorthand", "css/background-shorthand");
    return examples;
}