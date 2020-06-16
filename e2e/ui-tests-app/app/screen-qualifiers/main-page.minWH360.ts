import { EventData } from "tns-core-modules/data/observable";
import { Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    
    page.bindingContext = new Observable();
    page.bindingContext.set("currentDate", "No date for alternate screens!");
}