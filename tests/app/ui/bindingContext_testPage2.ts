import pageModule = require("ui/page");

export function pageNavigatedTo(args: pageModule.NavigatedData) {
    var page = <pageModule.Page>args.object;
    page.bindingContext = args.context;
}