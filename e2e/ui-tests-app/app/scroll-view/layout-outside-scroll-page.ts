import { EventData as ObservableEventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { LayoutOutsideScrollViewModel } from "./layout-outside-scroll-view-model";

var viewModel = new LayoutOutsideScrollViewModel();

export function pageLoaded(args: ObservableEventData) {
    var page = <Page>args.object;

    page.bindingContext = viewModel;
}
