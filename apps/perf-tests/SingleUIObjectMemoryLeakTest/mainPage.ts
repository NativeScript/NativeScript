import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import enums = require("ui/enums");

export function createPage() {
    var mainStackLayout = new stackLayoutModule.StackLayout();
    mainStackLayout.orientation = enums.Orientation.vertical;

    var label = new labelModule.Label();
    mainStackLayout.addChild(label);
    if (label.ios) {// Hack for an iOS Arrange problem
        label.height = 80;
    }

    var timer = require("timer");
    var startButton = new buttonModule.Button();
    startButton.text = "Start timer";
    var intervalId;
    startButton.addEventListener(buttonModule.Button.tapEvent, function () {
        intervalId = timer.setInterval(intervalCallback, 100);
    });

    var stopButton = new buttonModule.Button();
    stopButton.text = "Stop timer";
    stopButton.addEventListener(buttonModule.Button.tapEvent, function () {
        timer.clearInterval(intervalId);
    });

    mainStackLayout.addChild(startButton);
    mainStackLayout.addChild(stopButton);

    var shouldAdd = true;
    var button;

    var intervalCallback = function () {
        if (shouldAdd) {
            button = new buttonModule.Button();
            button.text = "test";
            mainStackLayout.addChild(button);
            shouldAdd = false;
        } else {
            mainStackLayout.removeChild(button);
            shouldAdd = true;
        }
    };

    var page = new pagesModule.Page();
    page.content = mainStackLayout;
    return page;
}
//export var Page = page;