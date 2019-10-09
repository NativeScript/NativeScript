import * as pages from "tns-core-modules/ui/page";

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = { varStr: "5", varNum: 3, varTrue: true, varText: "Text" };
}
