/**
  * iOS specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");

var UIALERTVIEWDELEGATE = "UIAlertViewDelegate",
    STRING = "string",
    ALERT = "Alert",
    OK = "OK",
    CANCEL = "Cancel";

function createUIAlertView(options: dialogs.DialogOptions): UIKit.UIAlertView {
    var alert = new UIKit.UIAlertView();
    alert.title = options.title;
    alert.message = options.message;
    return alert;
}

function createDelegate(callback) {
    var delegateType = Foundation.NSObject.extends({}, {}).implements({
        protocol: UIALERTVIEWDELEGATE,
        implementation: {
            alertViewClickedButtonAtIndex: function (view, index) {
                callback(view, index);
            }
        }
    });
    return new delegateType;
}

function addButtonsToAlertDialog(alert: UIKit.UIAlertView, options: dialogs.ConfirmOptions): void {
    if (options.okButtonName) {
        alert.addButtonWithTitle(options.okButtonName);
    }

    if (options.cancelButtonName) {
        alert.addButtonWithTitle(options.cancelButtonName);
    }

    if (options.otherButtonName) {
        alert.addButtonWithTitle(options.otherButtonName);
    }
}

export function alert(arg: any): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, buttonName: OK } : arg

        var alert = createUIAlertView(options);

        if (options.buttonName) {
            alert.addButtonWithTitle(options.buttonName);
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

export function confirm(arg: any): promises.Promise<boolean> {
    var d = promises.defer<boolean>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, okButtonName: OK, cancelButtonName: CANCEL } : arg

        var alert = createUIAlertView(options);

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

export function prompt(arg: any): promises.Promise<dialogs.PromptResult> {
    var d = promises.defer<dialogs.PromptResult>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, okButtonName: OK, cancelButtonName: CANCEL } : arg

        var alert = createUIAlertView(options);
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