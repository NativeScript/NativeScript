import { ViewModel } from "~/listview/fragments/listview-fragment-view-model";

export function onPageLoaded(args) {
    const page = args.object;
    page.bindingContext = new ViewModel();
}