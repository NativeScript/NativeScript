import { Visibility } from "tns-core-modules/ui/styling/style-properties";
import { Label } from "tns-core-modules/ui/label";
import { EventData, TextBase } from "tns-core-modules/ui/text-base";
import { Page } from "tns-core-modules/ui/page";

export function foxTap(args: EventData) {
    let page = <Page>(<any>args.object).page;
    let foxTapped = page.getViewById<Label>("foxTapped");
    foxTapped.visibility = Visibility.VISIBLE;

    setTimeout(() => {
        foxTapped.visibility = Visibility.HIDDEN;
    }, 1000);

    console.log("foxTap");
}

export function dogTap(args: EventData) {
    let page = <Page>(<any>args.object).page;
    let dogTapped = page.getViewById<Label>("dogTapped");
    dogTapped.visibility = Visibility.VISIBLE;

    setTimeout(() => {
        dogTapped.visibility = Visibility.HIDDEN;
    }, 1000);

    console.log("dogTap");
}
