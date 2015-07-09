/**
 * iOS specific dialogs functions implementation.
 */

import dialogs = require("ui/dialogs");
import dialogs_common = require("ui/dialogs/dialogs-common");
import types = require("utils/types");
import utils = require("utils/utils");
import frame = require("ui/frame");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(dialogs_common, exports);

class UIAlertViewDelegateImpl extends NSObject implements UIAlertViewDelegate {
    public static ObjCProtocols = [UIAlertViewDelegate];

    static new(): UIAlertViewDelegateImpl {
        return <UIAlertViewDelegateImpl>super.new();
    }

    private _callback: (view: any, index: number) => void;

    public initWithCallback(callback: (view: any, index: number) => void): UIAlertViewDelegateImpl {
        this._callback = callback;
        return this;
    }

    public alertViewClickedButtonAtIndex(view, index) {
        this._callback(view, index);
    }
}

class UIActionSheetDelegateImpl extends NSObject implements UIActionSheetDelegate {
    public static ObjCProtocols = [UIActionSheetDelegate];

    static new(): UIActionSheetDelegateImpl {
        return <UIActionSheetDelegateImpl>super.new();
    }

    private _callback: (actionSheet: UIActionSheet, index: number) => void;

    public initWithCallback(callback: (actionSheet: UIActionSheet, index: number) => void): UIActionSheetDelegateImpl {
        this._callback = callback;
        return this;
    }

    public actionSheetClickedButtonAtIndex(actionSheet, index) {
        this._callback(actionSheet, index);
    }
}

function createUIAlertView(options: dialogs.DialogOptions): UIAlertView {
    var alert = new UIAlertView();
    alert.title = options && options.title ? options.title : "";
    alert.message = options && options.message ? options.message : "";;
    return alert;
}

function addButtonsToAlertDialog(alert: UIAlertView, options: dialogs.ConfirmOptions): void {
    if (!options) {
        return;
    }

    if (options.cancelButtonText) {
        alert.tag = 1;
        alert.addButtonWithTitle(options.cancelButtonText);
    }

    if (options.neutralButtonText) {
        alert.tag = alert.tag === 1 ? 12 : 2;
        alert.addButtonWithTitle(options.neutralButtonText);
    }

    if (options.okButtonText) {
        if (alert.tag === 1) {
            alert.tag = 13;
        } else if (alert.tag === 2) {
            alert.tag = 23;
        } else if (alert.tag === 12) {
            alert.tag = 123;
        } else {
            alert.tag = 3;
        }
        alert.addButtonWithTitle(options.okButtonText);
    }
}

function getDialogResult(alert: UIAlertView, index: number) {
    if (alert.tag === 1) {
        return false;
    } else if (alert.tag === 2) {
        return undefined;
    } else if (alert.tag === 3) {
        return true;
    } else if (alert.tag === 12) {
        return index === 0 ? false : undefined;
    } else if (alert.tag === 13) {
        return index === 0 ? false : true;
    } else if (alert.tag === 23) {
        return index === 0 ? undefined : true;
    } else if (alert.tag === 123) {
        if (index === 0) {
            return false;
        } else if (index === 1) {
            return undefined;
        } else if (index === 2) {
            return true;
        }
    }

    return undefined;
}

function addButtonsToAlertController(alertController: UIAlertController, options: dialogs.ConfirmOptions,
    okCallback?: Function, cancelCallback?: Function, neutralCallback?: Function): void {
    if (!options) {
        return;
    }

    if (types.isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.UIAlertActionStyleDefault, (arg: UIAlertAction) => {
            if (types.isFunction(cancelCallback)) {
                cancelCallback();
            }
        }));
    }

    if (types.isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, UIAlertActionStyle.UIAlertActionStyleDefault, (arg: UIAlertAction) => {
            if (types.isFunction(cancelCallback)) {
                neutralCallback();
            }
        }));
    }

    if (types.isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, UIAlertActionStyle.UIAlertActionStyleDefault, (arg: UIAlertAction) => {
            if (types.isFunction(okCallback)) {
                okCallback();
            }
        }));
    }
}

export function alert(arg: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            var options = types.isString(arg) ? { title: dialogs_common.ALERT, okButtonText: dialogs_common.OK, message: arg } : arg;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                if (options.okButtonText) {
                    alert.addButtonWithTitle(options.okButtonText);
                }

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve();
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.UIAlertControllerStyleAlert);

                addButtonsToAlertController(alertController, options, () => { resolve(); });

                showUIAlertController(alertController);
            }
        } catch (ex) {
            reject(ex);
        }
    });
}

export function confirm(arg: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            var options = types.isString(arg) ? { title: dialogs_common.CONFIRM, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL, message: arg } : arg;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                addButtonsToAlertDialog(alert, options);

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve(getDialogResult(alert, index));

                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.UIAlertControllerStyleAlert);

                addButtonsToAlertController(alertController, options, () => { resolve(true); }, () => { resolve(false) }, () => { resolve(undefined) });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

export function prompt(arg: any): Promise<dialogs.PromptResult> {
    var options: dialogs.PromptOptions;

    var defaultOptions = {
        title: dialogs_common.PROMPT,
        okButtonText: dialogs_common.OK,
        cancelButtonText: dialogs_common.CANCEL,
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
            var textField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                if (options.inputType === dialogs.inputType.password) {
                    alert.alertViewStyle = UIAlertViewStyle.UIAlertViewStyleSecureTextInput;
                } else {
                    alert.alertViewStyle = UIAlertViewStyle.UIAlertViewStylePlainTextInput;
                }

                addButtonsToAlertDialog(alert, options);

                textField = alert.textFieldAtIndex(0);
                textField.text = types.isString(options.defaultText) ? options.defaultText : "";

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert, index), text: textField.text });
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.UIAlertControllerStyleAlert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.text = types.isString(options.defaultText) ? options.defaultText : "";
                    arg.secureTextEntry = options && options.inputType === dialogs.inputType.password;
                });

                textField = alertController.textFields.firstObject;

                addButtonsToAlertController(alertController, options,
                    () => { resolve({ result: true, text: textField.text }); },
                    () => { resolve({ result: false, text: textField.text }) },
                    () => { resolve({ result: undefined, text: textField.text }) });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

export function login(arg: any): Promise<dialogs.LoginResult> {
    var options: dialogs.LoginOptions;

    var defaultOptions = { title: dialogs_common.LOGIN, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL };

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
            var userNameTextField: UITextField;
            var passwordTextField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                alert.alertViewStyle = UIAlertViewStyle.UIAlertViewStyleLoginAndPasswordInput;

                addButtonsToAlertDialog(alert, options);

                userNameTextField = alert.textFieldAtIndex(0);
                userNameTextField.text = types.isString(options.userName) ? options.userName : "";

                userNameTextField = alert.textFieldAtIndex(1);
                userNameTextField.text = types.isString(options.password) ? options.password : "";

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert, index), userName: userNameTextField.text, password: userNameTextField.text });
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.UIAlertControllerStyleAlert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Login";
                    arg.text = types.isString(options.userName) ? options.userName : "";
                });

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Password";
                    arg.secureTextEntry = true;
                    arg.text = types.isString(options.password) ? options.password : "";
                });

                userNameTextField = alertController.textFields.firstObject;
                passwordTextField = alertController.textFields.lastObject;

                addButtonsToAlertController(alertController, options,
                    () => { resolve({ result: true, userName: userNameTextField.text, password: passwordTextField.text }); },
                    () => { resolve({ result: false, userName: userNameTextField.text, password: passwordTextField.text }); },
                    () => { resolve({ result: undefined, userName: userNameTextField.text, password: passwordTextField.text }); });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

function showUIAlertController(alertController: UIAlertController) {
    var topMostFrame = frame.topmost();
    if (topMostFrame) {
        var viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
        if (viewController) {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0;
            }

            viewController.presentModalViewControllerAnimated(alertController, true);
        }
    }
}

export function action(arg: any): Promise<string> {
    var options: dialogs.ActionOptions;

    var defaultOptions = { cancelButtonText: dialogs_common.CANCEL };

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
            var i: number;
            var action: string;

            if (utils.ios.MajorVersion < 8) {
                var actionSheet = new UIActionSheet();

                if (types.isString(options.message)) {
                    actionSheet.title = options.message;
                }

                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action = options.actions[i];
                        if (types.isString(action)) {
                            actionSheet.addButtonWithTitle(action);
                        }
                    }
                }

                if (types.isString(options.cancelButtonText)) {
                    actionSheet.addButtonWithTitle(options.cancelButtonText);
                    actionSheet.cancelButtonIndex = actionSheet.numberOfButtons - 1;
                }

                var delegate = UIActionSheetDelegateImpl.new().initWithCallback(function (sender: UIActionSheet, index: number) {
                    resolve(sender.buttonTitleAtIndex(index));
                    delegate = undefined;
                });

                actionSheet.delegate = delegate;
                actionSheet.showInView(UIApplication.sharedApplication().keyWindow);
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.message, "", UIAlertControllerStyle.UIAlertControllerStyleActionSheet);

                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action = options.actions[i];
                        if (types.isString(action)) {
                            alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(action, UIAlertActionStyle.UIAlertActionStyleDefault, (arg: UIAlertAction) => {
                                resolve(arg.title);
                            }));
                        }
                    }
                }

                if (types.isString(options.cancelButtonText)) {
                    alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.UIAlertActionStyleCancel, (arg: UIAlertAction) => {
                        resolve(arg.title);
                    }));
                }

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}