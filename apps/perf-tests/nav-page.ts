import definition = require("app/controls-page");
import frameModule = require("ui/frame");
import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import buttonModule = require("ui/button");
import textFieldModule = require("ui/text-field");
import enums = require("ui/enums");

export class NavPage extends pagesModule.Page implements definition.ControlsPage {
    constructor(id: number) {
        super();

        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.orientation = enums.Orientation.vertical;

        var goBackButton = new buttonModule.Button();
        goBackButton.text = "<-";
        goBackButton.on(buttonModule.knownEvents.tap, function () {
            frameModule.topmost().goBack();
        });
        stackLayout.addChild(goBackButton);

        var stateLabel = new labelModule.Label();
        stateLabel.text = "NavPage " + id;
        stackLayout.addChild(stateLabel);

        var textField = new textFieldModule.TextField();
        textField.text = "";
        stackLayout.addChild(textField);

        var changeStateButton = new buttonModule.Button();
        changeStateButton.text = "Click me!"
        var clickCount = 0;
        changeStateButton.on(buttonModule.knownEvents.tap, () => {
            //stateLabel.text = "<<<CHANGED STATE>>>";
            //textField.text = "<<<CHANGED STATE>>>";
            changeStateButton.text = (clickCount++).toString();
        });
        stackLayout.addChild(changeStateButton);

        var forwardButton = new buttonModule.Button();
        forwardButton.text = "->";
        forwardButton.on(buttonModule.knownEvents.tap, function () {
            var pageFactory = function () {
                return new NavPage(id + 1);
            };
            frameModule.topmost().navigate(pageFactory);
        });
        stackLayout.addChild(forwardButton);

        this.content = stackLayout;
    }
} 
