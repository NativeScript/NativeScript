import pages = require("ui/page");

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = { varFalse: false, varTrue: true, varText: "Text" };
}