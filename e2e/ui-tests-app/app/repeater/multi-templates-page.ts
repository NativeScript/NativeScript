import { EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Page } from "tns-core-modules/ui/page";
import { ViewModel } from "./multi-templates-view-model";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = new ViewModel();
}

export function getOddEvenTemplate(item: number, index: number, items: ObservableArray<number>): string
{
    return index % 2 == 0 ? "even" : "";
}