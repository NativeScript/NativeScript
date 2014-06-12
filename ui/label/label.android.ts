import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

var TEXT = "text";

// this is the name of the property to store text locally until attached to a valid Context
var TEXTPRIVATE = "_text";

export class Label extends view.View {
    private _android: android.widget.TextView;

    constructor() {
        super();
    }

    public onInitialized(context: android.content.Context) {
        if (!this._android) {
            // TODO: We need to decide whether we will support context switching and if yes - to implement it.
            this.createUI(context);
        }
    }

    get android(): android.widget.TextView {
        return this._android;
    }

    get text(): string {
        if (!this._android) {
            return this[TEXTPRIVATE];
        }
        return this._android.getText().toString();
    }
    set text(value: string) {
        this.setProperty(TEXT, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === TEXT) {
            if (this._android) {
                this._android.setText(data.value);
            } else {
                this[TEXTPRIVATE] = data.value;
            }
        } else if (true) {
        }
    }

    private createUI(context: android.content.Context) {
        this._android = new android.widget.TextView(context);
        if (this[TEXTPRIVATE]) {
            this._android.setText(this[TEXTPRIVATE]);
            delete this[TEXTPRIVATE];
        }

        // TODO: Do we need to listen for text change here?
        //var that = this;
        //var textWatcher = new android.text.TextWatcher({
        //    beforeTextChanged: function (text: string, start: number, count: number, after: number) {
        //    },
        //    onTextChanged: function (text: string, start: number, before: number, count: number) {
        //    },
        //    afterTextChanged: function (editable: android.text.IEditable) {
        //        that.updateTwoWayBinding("text", editable.toString());
        //    }
        //});
        //this._android.addTextChangedListener(textWatcher);
    }
} 