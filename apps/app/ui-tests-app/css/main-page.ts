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
    examples.set("tabmore", "css/tab-view-more");
    examples.set("spacing", "css/letter-spacing");
    examples.set("decoration", "css/text-decoration");
    examples.set("transform", "css/text-transform");
    examples.set("whitespace", "css/white-space");
    examples.set("switch", "css/views");
    examples.set("zindex", "css/zindex");
    examples.set("clipPath", "css/clip-path");
    examples.set("padding", "css/padding");
    examples.set("label-background-image", "css/label-background-image");
    examples.set("text-transform-and-color", "css/text-transform-and-color");

    let viewModel = new SubMianPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMianPageViewModel extends MianPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}