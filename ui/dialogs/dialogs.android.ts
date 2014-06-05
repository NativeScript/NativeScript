/**
  * Android specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import appmodule = require("application");

var STRING = "string",
    ALERT = "Alert",
    OK = "OK",
    CANCEL = "Cancel";

function createAlertDialog(options: dialogs.DialogOptions): android.app.AlertDialog.Builder {
    var alert = new android.app.AlertDialog.Builder(appmodule.android.foregroundActivity);
    alert.setTitle(options.title);
    alert.setMessage(options.message);
    return alert;
}

function addOkCancelButtonsToAlertDialog(alert: android.app.AlertDialog.Builder, options: dialogs.ConfirmOptions,
    okCallback: Function, cancelCallback?: Function): void {
    alert.setPositiveButton(options.okButtonName, new android.content.DialogInterface.OnClickListener({
        onClick: function (dialog: android.content.DialogInterface, id: number) {
            dialog.cancel();
            okCallback();
        }
    }));

    alert.setNegativeButton(options.cancelButtonName, new android.content.DialogInterface.OnClickListener({
        onClick: function (dialog: android.content.DialogInterface, id: number) {
            dialog.cancel();
            if (cancelCallback) {
                cancelCallback();
            }
        }
    }));
}

export function alert(arg: any): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var options = typeof arg === STRING ? { message: arg, title: ALERT, buttonName: OK } : arg

        var alert = createAlertDialog(options);

        alert.setPositiveButton(options.buttonName, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                d.resolve();
            }
        }));

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

        var alert = createAlertDialog(options);

        addOkCancelButtonsToAlertDialog(alert, options, function () { d.resolve(true); }, function () { d.resolve(false); });

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

        var alert = createAlertDialog(options);

        var input = new android.widget.EditText(appmodule.android.context);
        input.setText(options.defaultText ? options.defaultText : "");

        alert.setView(input);

        addOkCancelButtonsToAlertDialog(alert, options, function () { d.resolve(input.getText().toString()); });

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}