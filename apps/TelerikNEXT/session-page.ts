import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import appViewModel = require("./app-view-model");

export function pageNavigatedTo(args: observable.EventData) {
    var page = <pages.Page>args.object;

    page.bindingContext = page.navigationContext;
}

export function toggleFavorite(args: gestures.GestureEventData) {
    var item = <appViewModel.SessionModel>args.view.bindingContext;

    item.favorite = !item.favorite;
}