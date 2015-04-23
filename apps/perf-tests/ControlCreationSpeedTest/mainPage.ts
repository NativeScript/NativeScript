import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import frameModule = require("ui/frame");
import controlsPageModule = require("controls-page");
import enums = require("ui/enums");

export function createPage() {
    var page = new pagesModule.Page();

    var mainLayout = new stackLayoutModule.StackLayout();
    mainLayout.orientation = enums.Orientation.vertical;
    page.content = mainLayout;

    if (mainLayout.ios) {//HACK for the wrong iOS arrange;
        var spacer = new stackLayoutModule.StackLayout();
        spacer.height = 100;
        mainLayout.addChild(spacer);
    }

    var infoLabel = new labelModule.Label();
    infoLabel.text = "Objects to create in thousands:";
    mainLayout.addChild(infoLabel);

    var addCountButtonFunc = function (text) {
        var button = new buttonModule.Button();
        button.text = text;
        button.width = 40;
        button.on(buttonModule.Button.tapEvent, function (eventData) {
            count = ((<any>eventData.object).text) * 1000;
            countLabel.text = "Create " + count + " objects of type:";
        });
        countButtonLayout.addChild(button);
    };

    var count = 1000;
    var countButtonLayout = new stackLayoutModule.StackLayout();
    countButtonLayout.orientation = enums.Orientation.horizontal;

    mainLayout.addChild(countButtonLayout);

    var countLabel = new labelModule.Label();
    mainLayout.addChild(countLabel);
    countLabel.text = "Create " + count + " million objects of type:";

    addCountButtonFunc("0");
    addCountButtonFunc("1");
    addCountButtonFunc("2");
    addCountButtonFunc("3");
    addCountButtonFunc("4");
    addCountButtonFunc("5");
    addCountButtonFunc("6");
    addCountButtonFunc("7");
    addCountButtonFunc("8");
    addCountButtonFunc("9");
    addCountButtonFunc("10");

    var onClickHandler = function (eventData) {
        var controlConstructor;

        switch (eventData.object.text) {
            case "Button":
                controlConstructor = buttonModule.Button;
                resultsLabel.text = count + " Button";
                break;
            case "Label":
                controlConstructor = labelModule.Label;
                resultsLabel.text = count + " Label";
                break;
        }

        var pageFactory = function() {
            return new controlsPageModule.ControlsPage(controlConstructor, count, 10);
        };
        frameModule.topmost().navigate(pageFactory);
    };

    var addControlButtonFunc = function (text) {
        var button = new buttonModule.Button();
        button.text = text;
        button.on(buttonModule.Button.tapEvent, onClickHandler);
        mainLayout.addChild(button);
    };

    addControlButtonFunc("Button");
    addControlButtonFunc("Label");

    var resultsLabel = new labelModule.Label();
    mainLayout.addChild(resultsLabel);
    return page;
}
