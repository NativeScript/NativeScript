import { Page } from "tns-core-modules/ui/page";
import { ListViewViewModel } from "~/listview/fragments/listview-fragment-view-model";

export function onLoaded(args) {
    const page = <Page>args.object;
    page.bindingContext = new ListViewViewModel();
}