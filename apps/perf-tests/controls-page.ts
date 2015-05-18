import definition = require("controls-page");
import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import buttonModule = require("ui/button");
import trace = require("trace");
import frameModule = require("ui/frame");
import enums = require("ui/enums");

export class ControlsPage extends pagesModule.Page implements definition.ControlsPage {
    private _controlConstructor: () => void;
    private _count: number;
    private _controlsPerRow: number;
    private _childStackLayoutCount: number;

    private _mainLayout: stackLayoutModule.StackLayout;
    private _infoLabel;

    constructor(controlConstructor: () => any, count: number, controlsPerRow: number) {
        super();
        this._controlConstructor = controlConstructor;
        this._count = count;
        this._controlsPerRow = controlsPerRow;
        this._childStackLayoutCount = this._count / this._controlsPerRow;

        this._mainLayout = new stackLayoutModule.StackLayout();
        this._mainLayout.orientation = enums.Orientation.vertical;

        this._infoLabel = new labelModule.Label();
        this._mainLayout.addChild(this._infoLabel);

        var goBackButton = new buttonModule.Button();
        goBackButton.text = "Back";
        goBackButton.on(buttonModule.Button.tapEvent, function () {
            frameModule.topmost().goBack();
        });
        this._mainLayout.addChild(goBackButton);

        this.content = this._mainLayout;
    }

    public onNavigatedTo() {
        trace.write("Creating " + this._count + " controls...", trace.categories.Test, trace.messageType.info);
        this._infoLabel.text = "Creating " + this._count + " controls...";
        var startTime = new Date().getMilliseconds();
        for (var i = 0; i < this._childStackLayoutCount; i++) {
            var childStackLayout = new stackLayoutModule.StackLayout();
            childStackLayout.orientation = enums.Orientation.horizontal;
            this._mainLayout.addChild(childStackLayout);
            for (var j = 0; j < this._controlsPerRow; j++) {
                var control = new this._controlConstructor();
                control.text = "" + i + j;
                childStackLayout.addChild(control);
            }
        }
        var elapsedTime = Math.round(new Date().getMilliseconds() - startTime);
        var message = "Created " + this._count + " controls in " + elapsedTime + " ms.";
        trace.write(message, trace.categories.Test, trace.messageType.info);
        this._infoLabel.text = message;
    }
}
