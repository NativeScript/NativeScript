import observable = require("data/observable");
import frame = require("ui/frame");

export function itemTap(args: observable.EventData) {
    frame.topmost().navigate({
        moduleName: "pages/" + args.object.get("tag"),
    });
}
 
export function setStyle(args) {
    var page = args.object.actionBar.page;

    page.css = "ActionBar { color: red; }";
}

export function clearStyle(args) {
    var page = args.object.actionBar.page;

    page.css = "Page { background-color: red; }";
}
