import placeholder = require("ui/placeholder");

export function creatingView(args: placeholder.CreateViewEventData) {
    var nativeView = new UILabel();
    nativeView.text = "Native";
    args.view = nativeView;
}