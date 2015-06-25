import pageModule = require("ui/page");
import absoluteLayout = require("ui/layouts/absolute-layout");
import model = require("./myview");

var count = 0;

export function onLoaded(args: { eventName: string, object: any }) {
    var page = <pageModule.Page>args.object;
    page.bindingContext = new model.ViewModel();
}

export function onSetLeftSetTop(args: { eventName: string, object: any }) {
    var layout = args.object.parent;
    var child = layout.getViewById("setLeftSetTop");
    if(++count % 2 === 1) {
        absoluteLayout.AbsoluteLayout.setLeft(child, 175);
        absoluteLayout.AbsoluteLayout.setTop(child, 375);
    } else {
        absoluteLayout.AbsoluteLayout.setLeft(child, 0);
        absoluteLayout.AbsoluteLayout.setTop(child, 400);
    }
}