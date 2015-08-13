import observable = require("data/observable");

export function pageLoaded(args) {
    var page = args.object;

    page.bindingContext = { html: "one<br>two" };
}