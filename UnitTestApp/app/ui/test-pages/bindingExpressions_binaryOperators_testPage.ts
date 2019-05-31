import * as pages from "tns-core-modules/ui/page";

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = { var0: 0, var1: 1 };
}
