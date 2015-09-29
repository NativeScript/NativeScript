/**
 * Android specific dialogs functions implementation.
 */

import dialogs = require("ui/dialogs");
import dialogsCommon = require("./dialogs-common");
import appmodule = require("application");
import types = require("utils/types");

global.moduleMerge(dialogsCommon, exports);

function createAlertDialog(options?: dialogs.DialogOptions): android.app.AlertDialog.Builder {
    var alert = new android.app.AlertDialog.Builder(appmodule.android.foregroundActivity);
    alert.setTitle(options && types.isString(options.title) ? options.title : "");
    alert.setMessage(options && types.isString(options.message) ? options.message : "");
    return alert;
}

function addButtonsToAlertDialog(alert: android.app.AlertDialog.Builder, options: dialogs.ConfirmOptions,
    callback: Function): void {

    if (!options) {
        return;
    }

    if (options.okButtonText) {
        alert.setPositiveButton(options.okButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                callback(true);
            }
        }));
    }

    if (options.cancelButtonText) {
        alert.setNegativeButton(options.cancelButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                callback(false);
            }
        }));
    }

    if (options.neutralButtonText) {
        alert.setNeutralButton(options.neutralButtonText, new android.content.DialogInterface.OnClickListener({
            onClick: function (dialog: android.content.DialogInterface, id: number) {
                dialog.cancel();
                callback(undefined);
            }
        }));
    }
}

export function alert(arg: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            var options = types.isString(arg) ? { title: dialogsCommon.ALERT, okButtonText: dialogsCommon.OK, message: arg } : arg;

            var alert = createAlertDialog(options);

            alert.setPositiveButton(options.okButtonText, new android.content.DialogInterface.OnClickListener({
                onClick: function (dialog: android.content.DialogInterface, id: number) {
                    dialog.cancel();
                    resolve();
                }
            }));

            alert.show();

        } catch (ex) {
            reject(ex);
        }
    });
}

export function confirm(arg: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            var options = types.isString(arg) ? { title: dialogsCommon.CONFIRM, okButtonText: dialogsCommon.OK, cancelButtonText: dialogsCommon.CANCEL, message: arg } : arg;
            var alert = createAlertDialog(options);

            addButtonsToAlertDialog(alert, options, function (result) { resolve(result); });

            alert.show();

        } catch (ex) {
            reject(ex);
        }
    });
}

export function prompt(arg: any): Promise<dialogs.PromptResult> {
    var options: dialogs.PromptOptions;

    var defaultOptions = {
        title: dialogsCommon.PROMPT,
        okButtonText: dialogsCommon.OK,
        cancelButtonText: dialogsCommon.CANCEL,
        inputType: dialogs.inputType.text,
    };

    if (arguments.length === 1) {
        if (types.isString(arg)) {
            options = defaultOptions;
            options.message = arg;
        } else {
            options = arg;
        }
    } else if (arguments.length === 2) {
        if (types.isString(arguments[0]) && types.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.defaultText = arguments[1];
        }
    }

    return new Promise<dialogs.PromptResult>((resolve, reject) => {
        try {
            var alert = createAlertDialog(options);

            var input = new android.widget.EditText(appmodule.android.currentContext);

            if (options && options.inputType === dialogs.inputType.password) {
                input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
            }

            input.setText(options && options.defaultText || "");

            alert.setView(input);

            var getText = function () { return input.getText().toString(); };

            addButtonsToAlertDialog(alert, options, function (r) { resolve({ result: r, text: getText() }); });

            alert.show();

        } catch (ex) {
            reject(ex);
        }

    });
}

export function login(arg: any): Promise<dialogs.LoginResult> {
    var options: dialogs.LoginOptions;

    var defaultOptions = { title: dialogsCommon.LOGIN, okButtonText: dialogsCommon.OK, cancelButtonText: dialogsCommon.CANCEL };

    if (arguments.length === 1) {
        if (types.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        } else {
            options = arguments[0];
        }
    } else if (arguments.length === 2) {
        if (types.isString(arguments[0]) && types.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
        }
    } else if (arguments.length === 3) {
        if (types.isString(arguments[0]) && types.isString(arguments[1]) && types.isString(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
            options.password = arguments[2];
        }
    }

    return new Promise<dialogs.LoginResult>((resolve, reject) => {
        try {
            var context = appmodule.android.currentContext;

            var alert = createAlertDialog(options);

            var userNameInput = new android.widget.EditText(context);
            userNameInput.setText(options.userName ? options.userName : "");

            var passwordInput = new android.widget.EditText(context);
            passwordInput.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
            passwordInput.setText(options.password ? options.password : "");

            var layout = new android.widget.LinearLayout(context);
            layout.setOrientation(1);
            layout.addView(userNameInput);
            layout.addView(passwordInput);

            alert.setView(layout);

            addButtonsToAlertDialog(alert, options, function (r) {
                resolve({
                    result: r,
                    userName: userNameInput.getText().toString(),
                    password: passwordInput.getText().toString()
                });
            });

            alert.show();

        } catch (ex) {
            reject(ex);
        }

    });
}

export function action(arg: any): Promise<string> {

    var options: dialogs.ActionOptions;

    var defaultOptions = { title: null, cancelButtonText: dialogsCommon.CANCEL };

    if (arguments.length === 1) {
        if (types.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        } else {
            options = arguments[0];
        }
    } else if (arguments.length === 2) {
        if (types.isString(arguments[0]) && types.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
        }
    } else if (arguments.length === 3) {
        if (types.isString(arguments[0]) && types.isString(arguments[1]) && types.isDefined(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
            options.actions = arguments[2];
        }
    }

    return new Promise<string>((resolve, reject) => {
        try {
            var activity = appmodule.android.foregroundActivity || appmodule.android.startActivity;
            var alert = new android.app.AlertDialog.Builder(activity);
            var message = options && types.isString(options.message) ? options.message : "";
            var title = options && types.isString(options.title) ? options.title : "";
            
            if (title) {
                alert.setTitle(title);
                alert.setMessage(message);
            }
            else {
                alert.setTitle(message);
            }

            if (options.actions) {
                alert.setItems(options.actions, new android.content.DialogInterface.OnClickListener({
                    onClick: function (dialog: android.content.DialogInterface, which: number) {
                        resolve(options.actions[which])
                    }
                }));
            }

            if (types.isString(options.cancelButtonText)) {
                alert.setNegativeButton(options.cancelButtonText, new android.content.DialogInterface.OnClickListener({
                    onClick: function (dialog: android.content.DialogInterface, id: number) {
                        dialog.cancel();
                        resolve(options.cancelButtonText)
                    }
                }));
            }
            alert.show();

        } catch (ex) {
            reject(ex);
        }
    });
}
