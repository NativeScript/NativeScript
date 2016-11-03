import { EventData } from "data/observable";
import { MainPageViewModel } from "../mainPage";
import { WrapLayout } from "ui/layouts/wrap-layout";
import { Page } from "ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();

    examples.set("absolute", "layouts/absolute");
    examples.set("dock", "layouts/dock");
    examples.set("grid", "layouts/grid");
    examples.set("myview", "layouts/myview");
    examples.set("stack", "layouts/stack");
    examples.set("wrap", "layouts/wrap");

    examples.set("pabsolute", "layouts-percent/absolute");
    examples.set("pdock", "layouts-percent/dock");
    examples.set("pgrid", "layouts-percent/grid");
    examples.set("pmyview", "layouts-percent/myview");
    examples.set("pstack", "layouts-percent/stack");
    examples.set("pwrap", "layouts-percent/wrap");

    let viewModel = new SubMainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}