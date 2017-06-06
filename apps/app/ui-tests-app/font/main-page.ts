import { EventData } from "tns-core-modules/data/observable";
import { TestPageMainViewModel } from "../test-page-main-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("fontbtn", "font/button");
    examples.set("fontlbl", "font/label");
    examples.set("fontfield", "font/text-field");
    examples.set("fontview", "font/text-view");
    examples.set("nordic", "/font/nordic/nordic");
    examples.set("customfonts", "font/custom-fonts");
    examples.set("all-fonts", "font/all-fonts");
    examples.set("awesome-3654", "font/font-awesome/issue-3654");

    return examples;
}

export class SubMainPageViewModel extends TestPageMainViewModel {
    constructor(container: WrapLayout, examples: Map<string, string>) {
        super(container, examples);
    }
}
