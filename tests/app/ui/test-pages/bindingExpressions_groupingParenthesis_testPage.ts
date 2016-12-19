import * as pages from "ui/page";

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = { var1: 1, var2: 2, var3: 3, var4: 4 };
}