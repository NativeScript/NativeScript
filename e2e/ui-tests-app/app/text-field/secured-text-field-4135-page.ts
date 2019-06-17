import * as observable from "tns-core-modules/data/observable";

export function pageLoaded(args) {
    var page = args.object;
    var textFieldSecured = page.getViewById("textFieldSecured");
    textFieldSecured.secure = true;

    var obj = new observable.Observable();
    obj.set("textProperty", "text");
    page.bindingContext = obj;
}
