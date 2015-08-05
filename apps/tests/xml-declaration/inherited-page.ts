import {Page} from "ui/page";
import {Label} from "ui/label";

export function pageLoaded(args) {
    var page = <Page>args.object;
    (<Label>page.content).text += " and loaded";
}
