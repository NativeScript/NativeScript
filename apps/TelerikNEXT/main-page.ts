import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import listView = require("ui/list-view");
import frame = require("ui/frame");
import appViewModel = require("./app-view-model");

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;

    page.bindingContext = appViewModel.appModel;
}

export function toggleFavorite(args: gestures.GestureEventData) {
    var item = <appViewModel.SessionModel>args.view.bindingContext;

    item.favorite = !item.favorite;
}


export function selectSession(args: listView.ItemEventData) { 
    frame.topmost().navigate({
        moduleName: "app/session-page",
        context: args.view.bindingContext
    });
}