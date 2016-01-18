import { Page, View, TextView } from "ui";
import gestures = require("ui/gestures");

export function onTouch(args: gestures.TouchGestureEventData) {
    var msg = " touch action: " + args.action +
        " x: " + Math.round(args.getX()) + " y: " + Math.round(args.getY()) +
        " count: " + args.getPointerCount();

    var p;
    msg += " ACTIVE: ";
    var pointers = args.getActivePointers();
    for (var index = 0; index < pointers.length; index++) {
        p = pointers[index];
        msg += " p" + index + "[" + Math.round(p.getX()) + ", " + Math.round(p.getY()) + "]"
    }

    msg += " ALL: ";
    pointers = args.getAllPointers();
    for (var index = 0; index < pointers.length; index++) {
        p = pointers[index];
        msg += " p" + index + "[" + Math.round(p.getX()) + ", " + Math.round(p.getY()) + "]"
    }

    console.log(msg);
    (<TextView>args.view.page.getViewById("output")).text += msg + "\n";
}

export function clear(args) {
    args.object.page.getViewById("output").text = "";
}
