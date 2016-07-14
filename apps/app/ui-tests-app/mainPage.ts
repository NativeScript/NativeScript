import { EventData } from "data/observable";
import { Page } from "ui/page";
import { MianPageViewModel } from "./main-page-view-model";
import buttonModule = require("ui/button");
import colorModule = require("color");
import * as platform from "platform";

var wrapLayout: any;
var page: Page;
var colors = ["#ff0000", "#0000cc", "#33cc33", "#33cc33"];
var viewModel: MianPageViewModel;
var isInitialized: boolean = false;
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function pageLoaded(args: EventData) {
    // Get the event sender
    page = <Page>args.object;
    var view = require("ui/core/view");
    wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");
    viewModel = new MianPageViewModel();
    page.bindingContext = viewModel;

    if (!isInitialized) {
        loadButtons();
        isInitialized = true;
    }
}

function loadButtons() {
    var count = 0;

    viewModel.examples.forEach((element, key) => {
        var btn = new buttonModule.Button();
        if (platform.isIOS) {
            btn.style.margin = "5";
        }else{
            btn.style.margin = "0";
        }
        btn.style.color = new colorModule.Color(colors[count++ % 3]);
        btn.on(buttonModule.Button.tapEvent, function (eventData) {
            let text = btn.text;
            viewModel.loadExample(text);
        }, this);

        btn.text = key;
        wrapLayout.addChild(btn)
    });
}