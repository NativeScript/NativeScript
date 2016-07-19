/**
 * iOS specific dialogs functions implementation.
 */
import dialogs = require("ui/dialogs");
import dialogsCommon = require("./dialogs-common");
import types = require("utils/types");
import utils = require("utils/utils");

global.moduleMerge(dialogsCommon, exports);

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
    alert.message = options && options.message ? options.message : "";
    return alert;
}

enum allertButtons {
    cancel = 1 << 0,
    neutral = 1 << 1,
    ok = 1 << 2,
}

function addButtonsToAlertDialog(alert: UIAlertView, options: dialogs.ConfirmOptions): void {
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
    var hasCancel = buttons & allertButtons.cancel;
    var hasNeutral = buttons & allertButtons.neutral;
    var hasOk = buttons & allertButtons.ok;

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

function addButtonsToAlertController(alertController: UIAlertController, options: dialogs.ConfirmOptions, callback?: Function): void {
    if (!options) {
        return;
    }

    if (types.isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, false);
        }));
    }

    if (types.isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, undefined);
        }));
    }

    if (types.isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
            raiseCallback(callback, true);
        }));
    }
}

function raiseCallback(callback, result) {
    if (types.isFunction(callback)) {
        callback(result);
    }
}
export function alert(arg: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            var options = !dialogsCommon.isDialogOptions(arg) ? { title: dialogsCommon.ALERT, okButtonText: dialogsCommon.OK, message: arg + "" } : arg;

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
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

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
            var options = !dialogsCommon.isDialogOptions(arg) ? { title: dialogsCommon.CONFIRM, okButtonText: dialogsCommon.OK, cancelButtonText: dialogsCommon.CANCEL, message: arg + "" } : arg;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                addButtonsToAlertDialog(alert, options);

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve(getDialogResult(alert.tag, index));

                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                addButtonsToAlertController(alertController, options, (r) => { resolve(r); });

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
            var textField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                if (options.inputType === dialogs.inputType.password) {
                    alert.alertViewStyle = UIAlertViewStyle.SecureTextInput;
                } else {
                    alert.alertViewStyle = UIAlertViewStyle.PlainTextInput;
                }

                addButtonsToAlertDialog(alert, options);

                textField = alert.textFieldAtIndex(0);
                textField.text = types.isString(options.defaultText) ? options.defaultText : "";

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert.tag, index), text: textField.text });
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.text = types.isString(options.defaultText) ? options.defaultText : "";
                    arg.secureTextEntry = options && options.inputType === dialogs.inputType.password;

                    var color = dialogsCommon.getTextFieldColor();
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
            var userNameTextField: UITextField;
            var passwordTextField: UITextField;

            if (utils.ios.MajorVersion < 8) {
                var alert = createUIAlertView(options);

                alert.alertViewStyle = UIAlertViewStyle.LoginAndPasswordInput;

                addButtonsToAlertDialog(alert, options);

                userNameTextField = alert.textFieldAtIndex(0);
                userNameTextField.text = types.isString(options.userName) ? options.userName : "";

                passwordTextField = alert.textFieldAtIndex(1);
                passwordTextField.text = types.isString(options.password) ? options.password : "";

                // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
                var delegate = UIAlertViewDelegateImpl.new().initWithCallback(function (view, index) {
                    resolve({ result: getDialogResult(alert.tag, index), userName: userNameTextField.text, password: passwordTextField.text });
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                });

                alert.delegate = delegate;

                alert.show();
            } else {
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Login";
                    arg.text = types.isString(options.userName) ? options.userName : "";

                    var color = dialogsCommon.getTextFieldColor();
                    if (color) {
                        arg.textColor = arg.tintColor = color.ios;
                    }
                });

                alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                    arg.placeholder = "Password";
                    arg.secureTextEntry = true;
                    arg.text = types.isString(options.password) ? options.password : "";

                    var color = dialogsCommon.getTextFieldColor();
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
    var currentPage = dialogsCommon.getCurrentPage();
    if (currentPage) {
        var viewController: UIViewController = currentPage.modal ? currentPage.modal.ios : currentPage.ios;
        if (viewController) {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0;
            }

            var color = dialogsCommon.getButtonColor();
            if (color) {
                alertController.view.tintColor = color.ios;
            }

            var lblColor = dialogsCommon.getLabelColor();
            if (lblColor) {
                if (alertController.title) {
                    var title = NSAttributedString.alloc().initWithStringAttributes(alertController.title, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
                    alertController.setValueForKey(title, "attributedTitle");
                }
                if (alertController.message) {
                    var message = NSAttributedString.alloc().initWithStringAttributes(alertController.message, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
                    alertController.setValueForKey(message, "attributedMessage");
                }
            }

            viewController.presentModalViewControllerAnimated(alertController, true);
        }
    }
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
                var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.ActionSheet);

                if (options.actions) {
                    for (i = 0; i < options.actions.length; i++) {
                        action = options.actions[i];
                        if (types.isString(action)) {
                            alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(action, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
                                resolve(arg.title);
                            }));
                        }
                    }
                }

                if (types.isString(options.cancelButtonText)) {
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
