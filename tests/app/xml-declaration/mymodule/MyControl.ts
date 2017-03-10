import * as observable from "tns-core-modules/data/observable";
import * as stackLayoutModule from "tns-core-modules/ui/layouts/stack-layout";
import * as label from "tns-core-modules/ui/label";
import * as button from "tns-core-modules/ui/button";

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

        this.className = "MyStackLayout";
    }
}
