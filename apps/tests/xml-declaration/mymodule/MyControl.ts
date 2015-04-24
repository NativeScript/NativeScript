import observable = require("data/observable");
import stackLayoutModule = require("ui/layouts/stack-layout");
import label = require("ui/label");
import button = require("ui/button");

export class MyControl extends stackLayoutModule.StackLayout {
    constructor() {
        super();

        var counter: number = 0;

        var lbl = new label.Label();
        var btn = new button.Button();
        btn.text = "Tap me!";
        btn.on(button.Button.tapEvent, (args: observable.EventData) => {
            lbl.text = "Tap " + counter++;
        });

        this.addChild(lbl);
        this.addChild(btn);
    }
}