import { EventData } from "data/observable";
import { topmost } from "ui/frame";
import { Page } from "ui/page";

export function onNavigatingTo(args: EventData){
    let page = <Page>args.object;
    if (!page.bindingContext){
        page.bindingContext = new ViewModel();
    }
}

export class ViewModel {
    public navigate(args) {
        topmost().navigate(args.object.url);
    }
}