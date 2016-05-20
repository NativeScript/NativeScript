import pages = require("ui/page");

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = { author: "Pratchett" };
}