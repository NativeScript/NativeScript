import { EventData } from "tns-core-modules/data/observable";
import { SubMainPageViewModel } from "../../sub-main-page-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("system", "font/fonts-weight/system");
    examples.set("sans-serif", "font/fonts-weight/sans-serif");
    examples.set("serif", "font/fonts-weight/serif");
    examples.set("monospace", "font/fonts-weight/monospace");
    examples.set("courier-new", "font/fonts-weight/courier-new");
    examples.set("helvetica", "font/fonts-weight/helvetica");
    examples.set("custom-fontawesome", "font/fonts-weight/custom-fontawesome");
    examples.set("custom-muli", "font/fonts-weight/custom-muli");
    examples.set("custom-sofia", "font/fonts-weight/custom-sofia");
    examples.set("font-fallback", "font/fonts-weight/font-fallback");

    return examples;
} 