/**
 * iOS specific dialogs functions implementation.
 */

import { DialogOptions, ConfirmOptions, PromptOptions, PromptResult, LoginOptions, LoginResult, ActionOptions } from "ui/dialogs";
import { getCurrentPage, getLabelColor, getButtonColor, getTextFieldColor, isDialogOptions, inputType, ALERT, OK, CONFIRM, CANCEL, PROMPT, LOGIN } from "./dialogs-common";
import { isString, isDefined, isFunction } from "utils/types";
import * as utils from "utils/utils";
import getter = utils.ios.getter;

class UIAlertViewDelegateImpl extends NSObject implements UIAlertViewDelegate {
    public static ObjCProtocols = [UIAlertViewDelegate];

    private _callback: (view: any, index: number) => void;

    public static initWithCallback(callback: (view: any, index: number) => void): UIAlertViewDelegateImpl {
        let delegate = <UIAlertViewDelegateImpl>UIAlertViewDelegateImpl.new();
        delegate._callback = callback;
        return delegate;
    }

    public alertViewClickedButtonAtIndex(view, index) {
        this._callback(view, index);
    }
}

class UIActionSheetDelegateImpl extends NSObject implements UIActionSheetDelegate {
    public static ObjCProtocols = [UIActionSheetDelegate];

    private _callback: (actionSheet: UIActionSheet, index: number) => void;

    public static initWithCallback(callback: (actionSheet: UIActionSheet, index: number) => void): UIActionSheetDelegateImpl {
        let delegate = <UIActionSheetDelegateImpl>UIActionSheetDelegateImpl.new();
        delegate._callback = callback;
        return delegate;
    }

    public actionSheetClickedButtonAtIndex(actionSheet, index) {
        this._callback(actionSheet, index);
    }
}

function createUIAlertView(options: DialogOptions): UIAlertView {
    let alert = UIAlertView.new();
    alert.title = options && options.title ? options.title : "";
    alert.message = options && options.message ? options.message : "";
    return alert;
}

enum allertButtons {
    cancel = 1 << 0,
    neutral = 1 << 1,
    ok = 1 << 2,
}

function addButtonsToAlertDialog(alert: UIAlertView, options: ConfirmOptions): void {
    if (!options) {
        return;
    }

    if (options.cancelButtonText) {
        alert.tag = allertButtons.cancel;
        alert.addButtonWithTitle(options.cancelButtonText);
    }

    if (options.neutralButtonText) {
        alert.tag = alert.tag | allertButtons.neutral;
        alert.addButtonWithTitle(options.neutralButtonText);
    }

    if (options.okButtonText) {
        alert.tag = alert.tag | allertButtons.ok;
        alert.addButtonWithTitle(options.okButtonText);
    }
}

function getDialogResult(buttons: allertButtons, index: number) {
    let hasCancel = buttons & allertButtons.cancel;
    let hasNeutral = buttons & allertButtons.neutral;
    let hasOk = buttons & allertButtons.ok;

    if (hasCancel && hasNeutral && hasOk) {
        return index === 0 ? false : index === 2 ? true : undefined;
    } else if (buttons & hasNeutral && hasOk) {
        return index === 0 ? undefined : true;
    } else if (hasCancel && hasOk) {
        return index !== 0;
    } else if (hasCancel && hasNeutral) {
        return index === 0 ? false : undefined;
    } else if (hasCancel) {
        return false;
    } else if (hasOk) {
        return true;
    }

    return undefined;
}

function addButtonsToAlertController(alertController: UIAlertController, options: ConfirmOptions, callback?: Function): void {
    if (!options) {
        return;
    }

    if (isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, false);
        }));
    }

    if (isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, undefined);
        }));
    }

    if (isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, true);
        }));
    }
}

function raiseCallback(callback, result) {
    if (isFunction(callback)) {
        callback(result);
    }
}
export function alert(arg: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            let options = !isDialogOptions(arg) ? { title: ALERT, okButtonText: OK, message: arg + "" } : arg;

            if (utils.ios.MajorVersion < 8) {
                let alert = createUIAlertView(options);

                if (options.okButtonText) {
                    alert.addButtonWithTitle(options.okButtonText);
                }

                // Assign first to local letiable, otherwise it will be garbage collected since delegate is weak reference.
                let delegate = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve();
                    // Remove the local letiable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

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
            let options = !isDialogOptions(arg) ? { title: CONFIRM, okButtonText: OK, cancelButtonText: CANCEL, message: arg + "" } : arg;

            if (utils.ios.MajorVersion < 8) {
                let alert = createUIAlertView(options);

                addButtonsToAlertDialog(alert, options);

                // Assign first to local letiable, otherwise it will be garbage collected since delegate is weak reference.
                let delegate = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve(getDialogResult(alert.tag, index));

                    // Remove the local letiable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                addButtonsToAlertController(alertController, options, (r) => { resolve(r); });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

export function prompt(arg: any): Promise<PromptResult> {
    let options: PromptOptions;

    let defaultOptions = {
        title: PROMPT,
        okButtonText: OK,
        cancelButtonText: CANCEL,
        inputType: inputType.text,
    };

    if (arguments.length === 1) {
        if (isString(arg)) {
            options = defaultOptions;
            options.message = arg;
        } else {
            options = arg;
        }
    } else if (arguments.length === 2) {
        if (isString(arguments[0]) && isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.defaultText = arguments[1];
        }
    }

    return new Promise<PromptResult>((resolve, reject) => {
        try {
            let textField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                let alert = createUIAlertView(options);

                if (options.inputType === inputType.password) {
                    alert.alertViewStyle = UIAlertViewStyle.SecureTextInput;
                } else {
                    alert.alertViewStyle = UIAlertViewStyle.PlainTextInput;
                }

                addButtonsToAlertDialog(alert, options);

                textField = alert.textFieldAtIndex(0);
                textField.text = isString(options.defaultText) ? options.defaultText : "";

                // Assign first to local letiable, otherwise it will be garbage collected since delegate is weak reference.
                let delegate = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert.tag, index), text: textField.text });
                    // Remove the local letiable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.text = isString(options.defaultText) ? options.defaultText : "";
                    arg.secureTextEntry = options && options.inputType === inputType.password;

                    let color = getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });

                textField = alertController.textFields.firstObject;

                addButtonsToAlertController(alertController, options,
                    (r) => { resolve({ result: r, text: textField.text }); });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

export function login(arg: any): Promise<LoginResult> {
    let options: LoginOptions;

    let defaultOptions = { title: LOGIN, okButtonText: OK, cancelButtonText: CANCEL };

    if (arguments.length === 1) {
        if (isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        } else {
            options = arguments[0];
        }
    } else if (arguments.length === 2) {
        if (isString(arguments[0]) && isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
        }
    } else if (arguments.length === 3) {
        if (isString(arguments[0]) && isString(arguments[1]) && isString(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
            options.password = arguments[2];
        }
    }

    return new Promise<LoginResult>((resolve, reject) => {
        try {
            let userNameTextField: UITextField;
            let passwordTextField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                let alert = createUIAlertView(options);

                alert.alertViewStyle = UIAlertViewStyle.LoginAndPasswordInput;

                addButtonsToAlertDialog(alert, options);

                userNameTextField = alert.textFieldAtIndex(0);
                userNameTextField.text = isString(options.userName) ? options.userName : "";

                passwordTextField = alert.textFieldAtIndex(1);
                passwordTextField.text = isString(options.password) ? options.password : "";

                // Assign first to local letiable, otherwise it will be garbage collected since delegate is weak reference.
                let delegate = UIAlertViewDelegateImpl.initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert.tag, index), userName: userNameTextField.text, password: passwordTextField.text });
                    // Remove the local letiable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Login";
                    arg.text = isString(options.userName) ? options.userName : "";

                    let color = getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Password";
                    arg.secureTextEntry = true;
                    arg.text = isString(options.password) ? options.password : "";

                    let color = getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });

                userNameTextField = alertController.textFields.firstObject;
                passwordTextField = alertController.textFields.lastObject;

                addButtonsToAlertController(alertController, options,
                    (r) => {

                        resolve({
                            result: r,
                            userName:
                            userNameTextField.text,
                            password: passwordTextField.text
                        });

                    });

                showUIAlertController(alertController);
            }

        } catch (ex) {
            reject(ex);
        }
    });
}

function showUIAlertController(alertController: UIAlertController) {
    let currentPage = getCurrentPage();
    if (currentPage) {
        let viewController: UIViewController = currentPage.modal ? currentPage.modal.ios : currentPage.ios;
        if (viewController) {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0;
            }

            let color = getButtonColor();
            if (color) {
                alertController.view.tintColor = color.ios;
            }

            let lblColor = getLabelColor();
            if (lblColor) {
                if (alertController.title) {
                    let title = NSAttributedString.alloc().initWithStringAttributes(alertController.title, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
                    alertController.setValueForKey(title, "attributedTitle");
                }
                if (alertController.message) {
                    let message = NSAttributedString.alloc().initWithStringAttributes(alertController.message, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
                    alertController.setValueForKey(message, "attributedMessage");
                }
            }

            viewController.presentModalViewControllerAnimated(alertController, true);
        }
    }
}

export function action(arg: any): Promise<string> {
    let options: ActionOptions;

    let defaultOptions = { title: null, cancelButtonText: CANCEL };

    if (arguments.length === 1) {
        if (isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        } else {
            options = arguments[0];
        }
    } else if (arguments.length === 2) {
        if (isString(arguments[0]) && isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
        }
    } else if (arguments.length === 3) {
        if (isString(arguments[0]) && isString(arguments[1]) && isDefined(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
            options.actions = arguments[2];
        }
    }

    return new Promise<string>((resolve, reject) => {
        try {
            let i: number;
            let action: string;

            if (utils.ios.MajorVersion < 8) {
                let actionSheet = UIActionSheet.new();

                if (isString(options.message)) {
                    actionSheet.title = options.message;
                }

                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action = options.actions[i];
                        if (isString(action)) {
                            actionSheet.addButtonWithTitle(action);
                        }
                    }
                }

                if (isString(options.cancelButtonText)) {
                    actionSheet.addButtonWithTitle(options.cancelButtonText);
                    actionSheet.cancelButtonIndex = actionSheet.numberOfButtons - 1;
                }

                let delegate = UIActionSheetDelegateImpl.initWithCallback(function (sender: UIActionSheet, index: number) {
                    resolve(sender.buttonTitleAtIndex(index));
                    delegate = undefined;
                });

                actionSheet.delegate = delegate;
                actionSheet.showInView(getter(UIApplication, UIApplication.sharedApplication).keyWindow);
            } else {
                let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.ActionSheet);

                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action = options.actions[i];
                        if (isString(action)) {
                            alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(action, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
                                resolve(arg.title);
                            }));
                        }
                    }
                }

                if (isString(options.cancelButtonText)) {
                    alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Cancel, (arg: UIAlertAction) => {
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