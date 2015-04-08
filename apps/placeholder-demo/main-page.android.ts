import placeholder = require("ui/placeholder");

export function creatingView(args: placeholder.CreateViewEventData) {
    var nativeView = new android.widget.LabelView(args.context);
    nativeView.setText("Native");
    args.view = nativeView;
}