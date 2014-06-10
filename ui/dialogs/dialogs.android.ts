/**
  * Android specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import dialogs_common = require("ui/dialogs/dialogs-common");
import appmodule = require("application");
import view = require("ui/core/view");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(dialogs_common, exports);

function createAlertDialog(message: string, options: dialogs.DialogOptions): android.app.AlertDialog.Builder {
    var alert = new android.app.AlertDialog.Builder(appmodule.android.foregroundActivity);
    alert.setTitle(options && options.title ? options.title : "");
    alert.setMessage(message);
    return alert;
}

function addButtonsToAlertDialog(alert: android.app.AlertDialog.Builder, options: dialogs.DialogButtonsOptions,
    okCallback: Function, cancelCallback?: Function, neutralCallback?: Function): void {

    if (options.okButtonText) {
        alert.setPositiveButton(options.okButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                okCallback();
            }
        }));
    }

    if (options.cancelButtonText) {
        alert.setNegativeButton(options.cancelButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                if (cancelCallback) {
                    cancelCallback();
                }
            }
        }));
    }

    if (options.neutralButtonText) {
        alert.setNeutralButton(options.neutralButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                if (neutralCallback) {
                    neutralCallback();
                }
            }
        }));
    }
}

export function alert(message: string, options = { title: dialogs_common.ALERT, okButtonText: dialogs_common.OK }): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var alert = createAlertDialog(message, options);

        alert.setPositiveButton(options.okButtonText, new android.content.DialogInterface.OnClickListener({
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

export function confirm(message: string, options = { title: dialogs_common.CONFIRM, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL }): promises.Promise<boolean> {
    var d = promises.defer<boolean>();
    try {
        var alert = createAlertDialog(message, options);

        addButtonsToAlertDialog(alert, options, function () { d.resolve(true); }, function () { d.resolve(false); }, function () { d.resolve(); });

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function prompt(message: string, defaultText?: string,
    options = { title: dialogs_common.PROMPT, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL, inputType: dialogs_common.InputType.PlainText }): promises.Promise<dialogs.PromptResult> {
    var d = promises.defer<dialogs.PromptResult>();
    try {
        var alert = createAlertDialog(message, options);

        var input = new android.widget.EditText(appmodule.android.context);

        if (options.inputType == dialogs_common.InputType.Password) {
            input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        }

        input.setText(defaultText ? defaultText : "");

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

export function login(message: string, userName?: string, password?: string,
    options = { title: dialogs_common.LOGIN, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL }): promises.Promise<dialogs.LoginResult> {
    var d = promises.defer<dialogs.LoginResult>();
    try {
        var context = appmodule.android.context;
        var alert = createAlertDialog(message, options);

        var userNameInput = new android.widget.EditText(context);
        userNameInput.setText(userName ? userName : "");

        var passwordInput = new android.widget.EditText(appmodule.android.context);
        passwordInput.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        passwordInput.setText(password ? password : "");

        var layout = new android.widget.LinearLayout(context);
        layout.setOrientation(1);
        layout.addView(userNameInput);
        layout.addView(passwordInput);

        alert.setView(layout);

        var getUserName = function () { return userNameInput.getText().toString(); };
        var getPassword = function () { return passwordInput.getText().toString(); };

        addButtonsToAlertDialog(alert, options, function () { d.resolve({ result: true, userName: getUserName(), password: getPassword() }); },
            function () { d.resolve({ result: false, userName: getUserName(), password: getPassword() }); },
            function () { d.resolve({ result: undefined, userName: getUserName(), password: getPassword() }); });

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