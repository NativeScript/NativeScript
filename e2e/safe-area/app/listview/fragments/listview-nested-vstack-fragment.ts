import { Page } from "ui/page";

import { ListViewViewModel } from "./listview-fragment-view-model";

export function onLoaded(args) {
    const page = <Page>args.object;
    page.bindingContext = new ListViewViewModel();
}