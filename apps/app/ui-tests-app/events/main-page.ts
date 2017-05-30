import { EventData } from "tns-core-modules/data/observable";
import { MainPageViewModel } from "../mainPage";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();

    examples.set("gestures", "gestures");
    examples.set("touch", "touch-event");
    examples.set("pan", "pan-event");
    examples.set("handlers", "handlers");
    examples.set("console", "console");
    examples.set("i61", "i61");
    examples.set("i73", "i73");
    examples.set("i86", "i86");

    let viewModel = new SubMainPageViewModel(wrapLayout, examples);
    viewModel.basePath="events";
    page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends MainPageViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}
