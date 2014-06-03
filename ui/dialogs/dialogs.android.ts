/**
  * Android specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import appmodule = require("application");

function createAlertDialog(options: dialogs.DialogOptions): android.app.AlertDialog.Builder {
    var alert = new android.app.AlertDialog.Builder(appmodule.android.currentActivity);
    alert.setTitle(options.title);
    alert.setMessage(options.message);
    return alert;
}

export function alert(arg: any): promises.Promise<any> {
    var d = promises.defer<any>();
    try {
        var options = typeof arg === "string" ? { message: arg, title: "Alert", buttonName: "OK" } : arg

        var alert = createAlertDialog(options);
        /*
        alert.setPositiveButton(options.buttonName, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
            }
        }));
*/
        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function confirm(arg: any): promises.Promise<boolean> {
    var d = promises.defer<boolean>();
    try {
        var options = typeof arg === "string" ? { message: arg, title: "Alert", okButtonName: "OK", cancelButtonName: "Cancel" } : arg

        var alert = createAlertDialog(options);

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function prompt(arg: any): promises.Promise<string> {
    var d = promises.defer<string>();
    try {
        var options = typeof arg === "string" ? { message: arg, title: "Alert", okButtonName: "OK", cancelButtonName: "Cancel" } : arg

        var alert = createAlertDialog(options);

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}