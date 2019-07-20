import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";

export function loaded(args) {
    const page = <Page>(<View>args.object).page;
    const view = page.getViewById("bottomNavigation");
    (<any>view).textTransform = "capitalize";
}

export function applyTap(args) {
    const page = <Page>(<View>args.object).page;
    const css = "#bottomNavigation { " + args.object.tag + " }";
    page.css = css;
}

export function resetTap(args) {
    const page = <Page>(<View>args.object).page;
    page.css = "";
}
