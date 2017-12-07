import { EventData } from "tns-core-modules/data/observable";
import { MainPageViewModel } from "./main-page-view-model";
import { Page } from "tns-core-modules/ui/page";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { isAndroid } from "tns-core-modules/platform"

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = page.getViewById<WrapLayout>("wrapLayoutWithExamples");
    const examples: Map<string, string> = new Map<string, string>();
    examples.set("animation", "animation/main-page");
    examples.set("action-bar", "action-bar/main-page");
    examples.set("bindings", "bindings/main-page");
    examples.set("button", "button/main-page");
    examples.set("css", "css/main-page");
    examples.set("dialogs", "dialogs/dialogs");
    examples.set("events", "events/main-page");
    examples.set("fonts", "font/main-page");
    examples.set("flexbox", "flexbox/flexbox-main-page");
    examples.set("htmlview", "html-view/html-view");
    examples.set("image-view", "image-view/main-page");
    examples.set("issues", "issues/main-page");
    examples.set("layouts", "layouts/main-page");
    examples.set("list-picker", "list-picker/main-page");
    examples.set("list-view", "list-view/main-page");
    examples.set("modalview", "modal-view/modal-view");
    examples.set("page", "page/main-page");
    examples.set("perf", "perf/main-page");
    examples.set("scroll-view", "scroll-view/main-page");
    examples.set("segStyle", "segmented-bar/all");
    examples.set("search-bar", "search-bar/main-page");
    examples.set("tab-view", "tab-view/main-page");
    examples.set("timePicker", "time-picker/time-picker");
    examples.set("text-field", "text-field/main-page");
    examples.set("text-view", "text-view/main-page");
    examples.set("webview", "web-view/main-page");
    examples.set("progress-bar", "progress-bar/main-page");
    examples.set("date-picker", "date-picker/date-picker");
    page.bindingContext = new MainPageViewModel(wrapLayout, examples);

    const parent = page.getViewById('parentLayout');
    const searchBar = page.getViewById('textView');
    if (isAndroid) {
        parent.android.setFocusableInTouchMode(true);
        parent.android.setFocusable(true);
        searchBar.android.clearFocus();
    }else{
        parent.style.marginBottom=10;
    }
}
