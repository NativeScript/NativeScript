import app = require("application");
import {Frame} from "ui/frame";
import {TabView} from "ui/tab-view";
import * as builder from "ui/builder";

app.on("launch", function (args) {
    var tabView = <TabView>builder.load((__dirname + "/main-page.xml"));
    args.root = tabView;
    var frame = <Frame>tabView.items[0].view;
    var basePath = "list-view";
        frame.navigate(basePath);
});

app.start();