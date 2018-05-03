import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label";

export function pageLoaded(args) {
    var page = <Page>args.object;
    (<Label>page.content).text += " and loaded";
}
