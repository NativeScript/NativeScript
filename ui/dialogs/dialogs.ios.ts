/**
  * iOS specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");

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

export function alert(arg: any): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, buttonName: OK } : arg

        var alert = createUIAlertView(options);

        alert.addButtonWithTitle(options.buttonName);

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

        alert.addButtonWithTitle(options.okButtonName);
        alert.addButtonWithTitle(options.cancelButtonName);

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve(index === 0);
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

export function prompt(arg: any): promises.Promise<string> {
    var d = promises.defer<string>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, okButtonName: OK, cancelButtonName: CANCEL } : arg

        var alert = createUIAlertView(options);
        alert.alertViewStyle = UIKit.UIAlertViewStyle.UIAlertViewStylePlainTextInput;
        alert.addButtonWithTitle(options.okButtonName);
        alert.addButtonWithTitle(options.cancelButtonName);

        var textField = alert.textFieldAtIndex(0);
        textField.text = options.defaultText ? options.defaultText : "";

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            if (index === 0) {
                d.resolve(textField.text);
            }
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