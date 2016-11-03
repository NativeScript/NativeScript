import { EventData } from "data/observable";
import { MainPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();

    examples.set("fontbtn", "font/button");
    examples.set("fontlbl", "font/label");
    examples.set("fontfield", "font/text-field");
    examples.set("fontview", "font/text-view");
    examples.set("nordic", "nordic/nordic");
    examples.set("customfonts", "font/custom-fonts");
    examples.set("all-fonts", "font/all-fonts");
    
    let viewModel = new SubMainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}