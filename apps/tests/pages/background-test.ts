import view = require("ui/core/view");
export function applyTap(args) {
    var el = view.getViewById(view.getAncestor(args.object, "Page"), "test-element");
    (<any>el).style = args.object.tag;
}

export function resetTap(args) {
    var el = view.getViewById(view.getAncestor(args.object, "Page"), "test-element");
    (<any>el).style = "";
}