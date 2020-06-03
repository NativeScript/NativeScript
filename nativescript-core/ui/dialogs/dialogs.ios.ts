/**
 * iOS specific dialogs functions implementation.
 */
import { ios as iosView, traceCategories, traceWrite, traceMessageType } from "../core/view";
import { ConfirmOptions, PromptOptions, PromptResult, LoginOptions, LoginResult, ActionOptions } from ".";
import { getCurrentPage, getLabelColor, getButtonColors, getTextFieldColor, isDialogOptions, inputType, capitalizationType, ALERT, OK, CONFIRM, CANCEL, PROMPT, parseLoginOptions } from "./dialogs-common";
import { isString, isDefined, isFunction } from "../../utils/types";
import { getRootView, ios } from "../../application";

export * from "./dialogs-common";

function addButtonsToAlertController(alertController: UIAlertController, options: ConfirmOptions, callback?: Function): void {
    if (!options) {
        return;
    }

    if (isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Default, () => {
            raiseCallback(callback, false);
        }));
    }

    if (isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, UIAlertActionStyle.Default, () => {
            raiseCallback(callback, undefined);
        }));
    }

    if (isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, UIAlertActionStyle.Default, () => {
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
            let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

            addButtonsToAlertController(alertController, options, () => { resolve(); });

            showUIAlertController(alertController);
        } catch (ex) {
            reject(ex);
        }
    });
}

export function confirm(arg: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            let options = !isDialogOptions(arg) ? { title: CONFIRM, okButtonText: OK, cancelButtonText: CANCEL, message: arg + "" } : arg;
            let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

            addButtonsToAlertController(alertController, options, (r) => { resolve(r); });

            showUIAlertController(alertController);
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
            let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

            alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                arg.text = isString(options.defaultText) ? options.defaultText : "";
                arg.secureTextEntry = options && options.inputType === inputType.password;

                if (options && options.inputType === inputType.email) {
                    arg.keyboardType = UIKeyboardType.EmailAddress;
                } else if (options && options.inputType === inputType.number) {
                    arg.keyboardType = UIKeyboardType.NumberPad;
                } else if (options && options.inputType === inputType.decimal) {
                    arg.keyboardType = UIKeyboardType.DecimalPad;
                } else if (options && options.inputType === inputType.phone) {
                    arg.keyboardType = UIKeyboardType.PhonePad;
                }

                let color = getTextFieldColor();
                if (color) {
                    arg.textColor = arg.tintColor = color.ios;
                }
            });

            textField = alertController.textFields.firstObject;

            if (options) {
                switch (options.capitalizationType) {
                    case capitalizationType.all: {
                        textField.autocapitalizationType = UITextAutocapitalizationType.AllCharacters; break;
                    }
                    case capitalizationType.sentences: {
                        textField.autocapitalizationType = UITextAutocapitalizationType.Sentences; break;
                    }
                    case capitalizationType.words: {
                        textField.autocapitalizationType = UITextAutocapitalizationType.Words; break;
                    }
                    default: {
                        textField.autocapitalizationType = UITextAutocapitalizationType.None;
                    }
                }
            }

            addButtonsToAlertController(alertController, options,
                (r) => { resolve({ result: r, text: textField.text }); });

            showUIAlertController(alertController);
        } catch (ex) {
            reject(ex);
        }
    });
}

export function login(...args: any[]): Promise<LoginResult> {
    let options: LoginOptions = parseLoginOptions(args);

    return new Promise<LoginResult>((resolve, reject) => {
        try {
            let userNameTextField: UITextField;
            let passwordTextField: UITextField;
            let alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

            let textFieldColor = getTextFieldColor();

            alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                arg.placeholder = "Login";
                arg.placeholder = options.userNameHint ? options.userNameHint : "";
                arg.text = isString(options.userName) ? options.userName : "";

                if (textFieldColor) {
                    arg.textColor = arg.tintColor = textFieldColor.ios;
                }
            });

            alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
                arg.placeholder = "Password";
                arg.secureTextEntry = true;
                arg.placeholder = options.passwordHint ? options.passwordHint : "";
                arg.text = isString(options.password) ? options.password : "";

                if (textFieldColor) {
                    arg.textColor = arg.tintColor = textFieldColor.ios;
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
        } catch (ex) {
            reject(ex);
        }
    });
}

function showUIAlertController(alertController: UIAlertController) {
    let viewController = ios.rootController;
   
    while (viewController && viewController.presentedViewController) {
        viewController = viewController.presentedViewController;
    }

    if (!viewController) {
      traceWrite(`No root controller found to open dialog.`, traceCategories.Error, traceMessageType.warn);
      
      return;
    }

    if (alertController.popoverPresentationController) {
        alertController.popoverPresentationController.sourceView = viewController.view;
        alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
        alertController.popoverPresentationController.permittedArrowDirections = 0;
    }

    let color = getButtonColors().color;
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

export function action(): Promise<string> {
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

        } catch (ex) {
            reject(ex);
        }
    });
}
