/**
  * iOS specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");

var UIALERTVIEWDELEGATE = "UIAlertViewDelegate",
    STRING = "string",
    PROMPT = "Prompt",
    CONFIRM = "Confirm",
    ALERT = "Alert",
    OK = "OK",
    CANCEL = "Cancel";

function createUIAlertView(message: string, options: dialogs.DialogOptions): UIKit.UIAlertView {
    var alert = new UIKit.UIAlertView();
    alert.title = options && options.title ? options.title : "";
    alert.message = message;
    return alert;
}

function createDelegate(callback) {
    var delegateType = Foundation.NSObject.extends({}, {}).implements({
        protocol: "UIAlertViewDelegate",
        implementation: {
            alertViewClickedButtonAtIndex: function (view, index) {
                callback(view, index);
            }
        }
    });
    return new delegateType;
}

function addButtonsToAlertDialog(alert: UIKit.UIAlertView, options: dialogs.ConfirmOptions): void {
    if (!options)
        return;

    if (options.okButtonText) {
        alert.addButtonWithTitle(options.okButtonText);
    }

    if (options.cancelButtonText) {
        alert.addButtonWithTitle(options.cancelButtonText);
    }

    if (options.otherButtonText) {
        alert.addButtonWithTitle(options.otherButtonText);
    }
}

export function alert(message: string, options = { title: ALERT, buttonText: OK }): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var alert = createUIAlertView(message, options);

        if (options.buttonText) {
            alert.addButtonWithTitle(options.buttonText);
        }

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve();
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();
    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function confirm(message: string, options  = { title: CONFIRM, okButtonText: OK, cancelButtonText: CANCEL }): promises.Promise<boolean> {
    var d = promises.defer<boolean>();
    try {
        var alert = createUIAlertView(message, options);

        addButtonsToAlertDialog(alert, options);

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve(index === 2 ? undefined : index === 0);
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function prompt(message: string, options = { title: PROMPT, okButtonText: OK, cancelButtonText: CANCEL, defaultText: "" }): promises.Promise<dialogs.PromptResult> {
    var d = promises.defer<dialogs.PromptResult>();
    try {
        var alert = createUIAlertView(message, options);
        alert.alertViewStyle = UIKit.UIAlertViewStyle.UIAlertViewStylePlainTextInput;

        addButtonsToAlertDialog(alert, options);

        var textField = alert.textFieldAtIndex(0);
        textField.text = options.defaultText ? options.defaultText : "";

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve({ result: index === 2 ? undefined : index === 0, text: textField.text });
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export class Dialog {
    private _ios: UIKit.UIAlertView;
    //private _view: view.View;
    //private _nativeView: UIKit.UIView;

    constructor() {
        this._ios = new UIKit.UIAlertView();
    }

    get ios(): UIKit.UIAlertView {
        return this._ios;
    }

    get title(): string {
        return this.ios.title;
    }
    set title(value: string) {
        this.ios.title = value;
    }
    /*
    get view(): view.View {
        return this._view;
    }
    set view(value: view.View) {
        this._view = value;
        this._nativeView = this._view.ios;
        this._nativeView.removeFromSuperview();

        // Not working on iOS7!
        this.ios.addSubview(this._nativeView);
    }*/

    public show() {
        this.ios.show();
    }

    public hide() {
        this.ios.dismissWithClickedButtonIndexAnimated(0, true);
    }
}