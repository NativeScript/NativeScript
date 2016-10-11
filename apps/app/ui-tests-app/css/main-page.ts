import { EventData } from "data/observable";
import { MianPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();
    examples.set("background", "css/background");
    examples.set("formatted", "css/decoration-transform-formattedtext");
    examples.set("csslv", "css/listview");
    examples.set("radius", "css/radius");
    examples.set("styles", "css/styles");
    examples.set("spacing", "css/letter-spacing");
    examples.set("decoration", "css/text-decoration");
    examples.set("transform", "css/text-transform");
    examples.set("whitespace", "css/white-space");
    examples.set("switch", "css/views");
    examples.set("zindex", "css/zindex");
    examples.set("clipPath", "css/clip-path");
    examples.set("padding", "css/padding");
    examples.set("label-background-image", "css/label-background-image");
    examples.set("transform-decoration-color", "css/transform-decoration-color");
    examples.set("layout-border", "css/layout-border");
    examples.set("label-border", "css/label-border");
    examples.set("button-border", "css/button-border");
    examples.set("text-field-border", "css/text-field-border");
    examples.set("text-view-border", "css/text-view-border");
    examples.set("image-border", "css/image-border");
    examples.set("layouts-border-overlap", "css/layouts-border-overlap");
    examples.set("measure-tests", "css/measure-tests");
    examples.set("all-uniform-border", "css/all-uniform-border");
    examples.set("all-non-uniform-border", "css/all-non-uniform-border");
    //examples.set("border-playground", "css/border-playground");

    let viewModel = new SubMianPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMianPageViewModel extends MianPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}