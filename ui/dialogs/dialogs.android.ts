/**
  * Android specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import appmodule = require("application");
import view = require("ui/core/view");

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

function addButtonsToAlertDialog(alert: android.app.AlertDialog.Builder, options: dialogs.ConfirmOptions,
    okCallback: Function, cancelCallback?: Function, neutralCallback?: Function): void {

    if (options.okButtonName) {
        alert.setPositiveButton(options.okButtonName, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                okCallback();
            }
        }));
    }

    if (options.cancelButtonName) {
        alert.setNegativeButton(options.cancelButtonName, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                if (cancelCallback) {
                    cancelCallback();
                }
            }
        }));
    }

    if (options.otherButtonName) {
        alert.setNeutralButton(options.otherButtonName, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                if (neutralCallback) {
                    neutralCallback();
                }
            }
        }));
    }
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

        addButtonsToAlertDialog(alert, options, function () { d.resolve(true); }, function () { d.resolve(false); }, function () { d.resolve(); });

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

        var alert = createAlertDialog(options);

        var input = new android.widget.EditText(appmodule.android.context);
        input.setText(options.defaultText ? options.defaultText : "");

        alert.setView(input);

        var getText = function () { return input.getText().toString(); };

        addButtonsToAlertDialog(alert, options, function () { d.resolve({ result: true, text: getText() }); },
            function () { d.resolve({ result: false, text: getText() }); },
            function () { d.resolve({ result: undefined, text: getText() }); });

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export class Dialog {
    private _dialog: android.app.AlertDialog;
    private _android: android.app.AlertDialog.Builder;
    private _title: string;
    //private _view: view.View;

    constructor() {
        this._android = new android.app.AlertDialog.Builder(appmodule.android.foregroundActivity);
    }

    get android(): android.app.AlertDialog.Builder {
        return this._android;
    }

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
        this.android.setTitle(this._title);
    }
    /*
    get view(): view.View {
        return this._view;
    }
    set view(value: view.View) {
        this._view = value;
        this.android.setView(this._view.android);
    }*/

    public show() {
        this._dialog = this.android.show();
    }

    public hide() {
        if (this._dialog) {
            this._dialog.hide();
        }
    }
}