import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import * as buttonModule from "tns-core-modules/ui/button";
import * as colorModule from "tns-core-modules/color";
import * as platform from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
import * as trace from "tns-core-modules/trace";
import * as observable from "tns-core-modules/data/observable";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Observable } from "tns-core-modules/data/observable";

export function pageLoaded(args: EventData) {
    let examples: Map<string, string> = new Map<string, string>();

    let page = <Page>args.object;
    let wrapLayout = page.getViewById<WrapLayout>("wrapLayoutWithExamples");
    
    examples.set("action-bar", "action-bar/main-page");
    
    examples.set("bindings", "bindings/main-page");
    examples.set("button","button/main-page");

    examples.set("css", "css/main-page");
    examples.set("image-view", "image-view/main-page");
    examples.set("tab-view", "tab-view/main-page");
    examples.set("layouts", "layouts/main-page");
    examples.set("events", "events/main-page");
    examples.set("webview", "web-view/main-page");
    examples.set("flexbox", "flexbox/flexbox-main-page");

    examples.set("modalview", "modal-view/modal-view");
    examples.set("dialogs", "dialogs/dialogs");
    examples.set("htmlview", "html-view/html-view");
    examples.set("timePicker", "time-picker/time-picker");
    examples.set("segStyle", "segmented-bar/all");
    examples.set("list-view", "list-view/main-page");
    examples.set("issues", "issues/main-page");
    examples.set("page", "page/main-page");

    examples.set("perf", "perf/main-page");
    examples.set("list-picker", "list-picker/main-page");

    examples.set("listview_binding", "pages/listview_binding");
    examples.set("textfield", "text-field/main-page");
    examples.set("button", "button/main-page");
    examples.set("perf", "perf/main-page");

    let viewModel = new MainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;

    var parent = page.getViewById('parentLayout');
    var searchBar = page.getViewById('textView');

    if (parent.android) {
        parent.android.setFocusableInTouchMode(true);
        parent.android.setFocusable(true);
        searchBar.android.clearFocus();
    }
}