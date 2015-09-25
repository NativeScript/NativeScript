import definition = require("controls-page");
import frameModule = require("ui/frame");
import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import buttonModule = require("ui/button");
import textFieldModule = require("ui/text-field");
import enums = require("ui/enums");
import switchModule = require("ui/switch");

export class NavPage extends pagesModule.Page implements definition.ControlsPage {
    constructor(id: number) {
        super();

        this.id = "NavPage " + id;

        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.orientation = enums.Orientation.vertical;

        var goBackButton = new buttonModule.Button();
        goBackButton.text = "<-";
        goBackButton.on(buttonModule.Button.tapEvent, function () {
            frameModule.topmost().goBack();
        });
        stackLayout.addChild(goBackButton);

        this.on(pagesModule.Page.navigatedToEvent, function () {
            //console.log("Navigated to NavPage " + id + "; backStack.length: " + frameModule.topmost().backStack.length);
            goBackButton.isEnabled = frameModule.topmost().canGoBack();
        });

        var stateLabel = new labelModule.Label();
        stateLabel.text = "NavPage " + id;
        stackLayout.addChild(stateLabel);

        var textField = new textFieldModule.TextField();
        textField.text = "";
        stackLayout.addChild(textField);

        var changeStateButton = new buttonModule.Button();
        changeStateButton.text = "Click me!"
        var clickCount = 0;
        changeStateButton.on(buttonModule.Button.tapEvent, () => {
            //stateLabel.text = "<<<CHANGED STATE>>>";
            //textField.text = "<<<CHANGED STATE>>>";
            changeStateButton.text = (clickCount++).toString();
        });
        stackLayout.addChild(changeStateButton);

        var optionsLayout = new stackLayoutModule.StackLayout();

        var addToBackStackLabel = new labelModule.Label();
        addToBackStackLabel.text = "backStackVisible";
        optionsLayout.addChild(addToBackStackLabel);

        var addToBackStackSwitch = new switchModule.Switch();
        addToBackStackSwitch.checked = true;
        optionsLayout.addChild(addToBackStackSwitch);

        var clearHistoryLabel = new labelModule.Label();
        clearHistoryLabel.text = "clearHistory";
        optionsLayout.addChild(clearHistoryLabel);

        var clearHistorySwitch = new switchModule.Switch();
        clearHistorySwitch.checked = false;
        optionsLayout.addChild(clearHistorySwitch);

        stackLayout.addChild(optionsLayout);

        var forwardButton = new buttonModule.Button();
        forwardButton.text = "->";
        forwardButton.on(buttonModule.Button.tapEvent, function () {
            var pageFactory = function () {
                return new NavPage(id + 1);
            };
            frameModule.topmost().navigate({
                create: pageFactory,
                backstackVisible: addToBackStackSwitch.checked,
                clearHistory: clearHistorySwitch.checked
            });
        });
        stackLayout.addChild(forwardButton);

        this.content = stackLayout;
    }
} 
