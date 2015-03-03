import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import nativeCallsWrapper = require("app/native-calls-wrapper");
import enums = require("ui/enums");

export function createPage() {
    var OBJECTS_COUNT = 10000;

    var mainStackLayout = new stackLayoutModule.StackLayout();
    mainStackLayout.orientation = enums.Orientation.vertical;

    var label = new labelModule.Label();
    label.width = 500;
    mainStackLayout.addChild(label);
    if (label.ios) {// Hack for an iOS Arrange problem
        label.height = 80;
    }

    var startButton = new buttonModule.Button();
    startButton.height = 50;
    startButton.width = 200;
    startButton.text = "Allocate memory";
    var startButtonClickHandler = function () {
        allocateMemory();
    };
    startButton.on(buttonModule.knownEvents.tap, startButtonClickHandler);

    var stopButton = new buttonModule.Button();
    stopButton.height = 50;
    stopButton.width = 200;
    stopButton.text = "Clear memory";
    var stopButtonClickHandler = function () {
        nativeCallsWrapper.forceGarbageCollection();
    };
    stopButton.on(buttonModule.knownEvents.tap, stopButtonClickHandler);

    mainStackLayout.addChild(startButton);
    mainStackLayout.addChild(stopButton);

    var allocateMemory = function () {
        var datesArray = [];
        var i;
        for (i = 0; i < OBJECTS_COUNT; i++) {
            var date = nativeCallsWrapper.createNativeDate();
            datesArray.push(date);
        }
    };

    var page = new pagesModule.Page();
    page.content = mainStackLayout;
    return page;
}
//export var Page = page;
