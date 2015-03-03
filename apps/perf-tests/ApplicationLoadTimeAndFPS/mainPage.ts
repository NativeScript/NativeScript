import pagesModule = require("ui/page");
import labelModule = require("ui/label");
import listViewModule = require("ui/list-view");
import stackLayoutModule = require("ui/layouts/stack-layout");
import imageSourceModule = require("image-source");
import imageModule = require("ui/image");
import enums = require("ui/enums");

export function createPage() {
    var logoImageSource = imageSourceModule.fromFile(__dirname + "/noimage.png");

    var createListViewItemFunc = function (): stackLayoutModule.StackLayout {
        var StackLayout = new stackLayoutModule.StackLayout();
        StackLayout.orientation = enums.Orientation.horizontal;

        var image = new imageModule.Image();
        image.source = logoImageSource;
        image.width = 100;
        image.stretch = enums.Stretch.aspectFit;
        StackLayout.addChild(image);

        var label = new labelModule.Label();
        label.text = "The quick brown fox jumps over the lazy dog!";
        StackLayout.addChild(label);

        return StackLayout;
    };

    var listView = new listViewModule.ListView();
    listView.items = new Array(100);

    listView.on(listViewModule.knownEvents.itemLoading, (args: listViewModule.ItemEventData) => {
        var StackLayout = <stackLayoutModule.StackLayout>args.view;
        if (!StackLayout) {
            StackLayout = createListViewItemFunc();
            args.view = StackLayout;
        }
    });

    var page = new pagesModule.Page();
    page.content = listView;
    return page;
}
//export var Page = page;