import observable = require("data/observable");
import pages = require("ui/page");
import model = require("./model");

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = new model.ViewModel();
}

export function onReset(args: observable.EventData) {
    var model = <model.ViewModel>(<any>args.object).bindingContext;
    model.reset();
}