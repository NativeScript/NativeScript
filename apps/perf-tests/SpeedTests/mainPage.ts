import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import testsModule = require("./tests");
import enums = require("ui/enums");

export function createPage() {
    var page = new pagesModule.Page();

    var mainLayout = new stackLayoutModule.StackLayout();
    mainLayout.orientation = enums.Orientation.vertical;
    page.content = mainLayout;

    var spacerGif = new stackLayoutModule.StackLayout();
    spacerGif.height = 70;
    mainLayout.addChild(spacerGif);

    var resultsLabel = new labelModule.Label();
    resultsLabel.text = "Select Test..................................................";
    mainLayout.addChild(resultsLabel);

    var dataMarshallingButton0 = new buttonModule.Button();
    dataMarshallingButton0.text = "Compare JavaScript dates 10000 times";
    mainLayout.addChild(dataMarshallingButton0);
    dataMarshallingButton0.on(buttonModule.Button.tapEvent, function () {
        resultsLabel.text = testsModule.compareJavaScriptDates(10000);
    });

    var dataMarshallingButton1 = new buttonModule.Button();
    dataMarshallingButton1.text = "Compare Native dates 10000 times";
    mainLayout.addChild(dataMarshallingButton1);
    dataMarshallingButton1.on(buttonModule.Button.tapEvent, function () {
        resultsLabel.text = testsModule.compareNativeDates(10000);
    });

    var dataMarshallingButton2 = new buttonModule.Button();
    dataMarshallingButton2.text = "Bitmap -> byte[] -> Bitmap 200 times";
    mainLayout.addChild(dataMarshallingButton2);
    dataMarshallingButton2.on(buttonModule.Button.tapEvent, function () {
        testsModule.decodeAndEncodeBitmap(200, function (message) {
            resultsLabel.text = message;
        });
    });
    return page;
}
//export var Page = page;
