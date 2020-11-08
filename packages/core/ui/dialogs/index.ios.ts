/**
 * iOS specific dialogs functions implementation.
 */
import { Trace } from '../../trace';
import { ConfirmOptions, PromptOptions, PromptResult, LoginOptions, LoginResult, ActionOptions, getCurrentPage, getLabelColor, getButtonColors, getTextFieldColor, isDialogOptions, inputType, capitalizationType, DialogStrings, parseLoginOptions } from './dialogs-common';
import { isString, isDefined, isFunction } from '../../utils/types';
import { getRootView, ios } from '../../application';

export * from './dialogs-common';

function addButtonsToAlertController(alertController: UIAlertController, options: ConfirmOptions, callback?: Function): void {
	if (!options) {
		return;
	}

	if (isString(options.cancelButtonText)) {
		alertController.addAction(
			UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Default, () => {
				raiseCallback(callback, false);
			})
		);
	}

	if (isString(options.neutralButtonText)) {
		alertController.addAction(
			UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, UIAlertActionStyle.Default, () => {
				raiseCallback(callback, undefined);
			})
		);
	}

	if (isString(options.okButtonText)) {
		alertController.addAction(
			UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, UIAlertActionStyle.Default, () => {
				raiseCallback(callback, true);
			})
		);
	}
}

function raiseCallback(callback, result) {
	if (isFunction(callback)) {
		callback(result);
	}
}

function showUIAlertController(alertController: UIAlertController) {
	let viewController = ios.rootController;

	while (viewController && viewController.presentedViewController) {
		viewController = viewController.presentedViewController;
	}

	if (!viewController) {
		Trace.write(`No root controller found to open dialog.`, Trace.categories.Error, Trace.messageType.warn);

		return;
	}

	if (alertController.popoverPresentationController) {
		alertController.popoverPresentationController.sourceView = viewController.view;
		alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
		alertController.popoverPresentationController.permittedArrowDirections = 0;
	}

	const color = getButtonColors().color;
	if (color) {
		alertController.view.tintColor = color.ios;
	}

	const lblColor = getLabelColor();
	if (lblColor) {
		if (alertController.title) {
			const title = NSAttributedString.alloc().initWithStringAttributes(alertController.title, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
			alertController.setValueForKey(title, 'attributedTitle');
		}
		if (alertController.message) {
			const message = NSAttributedString.alloc().initWithStringAttributes(alertController.message, <any>{ [NSForegroundColorAttributeName]: lblColor.ios });
			alertController.setValueForKey(message, 'attributedMessage');
		}
	}

	viewController.presentModalViewControllerAnimated(alertController, true);
}

export function alert(arg: any): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		try {
			const options = !isDialogOptions(arg) ? { title: DialogStrings.ALERT, okButtonText: DialogStrings.OK, message: arg + '' } : arg;
			const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

			addButtonsToAlertController(alertController, options, () => {
				resolve();
			});

			showUIAlertController(alertController);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function confirm(arg: any): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		try {
			const options = !isDialogOptions(arg)
				? {
						title: DialogStrings.CONFIRM,
						okButtonText: DialogStrings.OK,
						cancelButtonText: DialogStrings.CANCEL,
						message: arg + '',
				  }
				: arg;
			const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

			addButtonsToAlertController(alertController, options, (r) => {
				resolve(r);
			});

			showUIAlertController(alertController);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function prompt(...args): Promise<PromptResult> {
	let options: PromptOptions;

	const defaultOptions = {
		title: DialogStrings.PROMPT,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
		inputType: inputType.text,
	};
	const arg = args[0];
	if (args.length === 1) {
		if (isString(arg)) {
			options = defaultOptions;
			options.message = arg;
		} else {
			options = arg;
		}
	} else if (args.length === 2) {
		if (isString(arg) && isString(args[1])) {
			options = defaultOptions;
			options.message = arg;
			options.defaultText = args[1];
		}
	}

	return new Promise<PromptResult>((resolve, reject) => {
		try {
			const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

			alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
				arg.text = isString(options.defaultText) ? options.defaultText : '';
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

				const color = getTextFieldColor();
				if (color) {
					arg.textColor = arg.tintColor = color.ios;
				}
			});

			const textField: UITextField = alertController.textFields.firstObject;

			if (options) {
				switch (options.capitalizationType) {
					case capitalizationType.all: {
						textField.autocapitalizationType = UITextAutocapitalizationType.AllCharacters;
						break;
					}
					case capitalizationType.sentences: {
						textField.autocapitalizationType = UITextAutocapitalizationType.Sentences;
						break;
					}
					case capitalizationType.words: {
						textField.autocapitalizationType = UITextAutocapitalizationType.Words;
						break;
					}
					default: {
						textField.autocapitalizationType = UITextAutocapitalizationType.None;
					}
				}
			}

			addButtonsToAlertController(alertController, options, (r) => {
				resolve({ result: r, text: textField.text });
			});

			showUIAlertController(alertController);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function login(...args: any[]): Promise<LoginResult> {
	const options: LoginOptions = parseLoginOptions(args);

	return new Promise<LoginResult>((resolve, reject) => {
		try {
			const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.Alert);

			const textFieldColor = getTextFieldColor();

			alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
				arg.placeholder = 'Login';
				arg.placeholder = options.userNameHint ? options.userNameHint : '';
				arg.text = isString(options.userName) ? options.userName : '';

				if (textFieldColor) {
					arg.textColor = arg.tintColor = textFieldColor.ios;
				}
			});

			alertController.addTextFieldWithConfigurationHandler((arg: UITextField) => {
				arg.placeholder = 'Password';
				arg.secureTextEntry = true;
				arg.placeholder = options.passwordHint ? options.passwordHint : '';
				arg.text = isString(options.password) ? options.password : '';

				if (textFieldColor) {
					arg.textColor = arg.tintColor = textFieldColor.ios;
				}
			});
			const userNameTextField: UITextField = alertController.textFields.firstObject;
			const passwordTextField: UITextField = alertController.textFields.lastObject;

			addButtonsToAlertController(alertController, options, (r) => {
				resolve({
					result: r,
					userName: userNameTextField.text,
					password: passwordTextField.text,
				});
			});

			showUIAlertController(alertController);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function action(...args): Promise<string> {
	let options: ActionOptions;

	const defaultOptions = { title: null, cancelButtonText: DialogStrings.CANCEL };

	if (args.length === 1) {
		if (isString(args[0])) {
			options = defaultOptions;
			options.message = args[0];
		} else {
			options = args[0];
		}
	} else if (args.length === 2) {
		if (isString(args[0]) && isString(args[1])) {
			options = defaultOptions;
			options.message = args[0];
			options.cancelButtonText = args[1];
		}
	} else if (args.length === 3) {
		if (isString(args[0]) && isString(args[1]) && isDefined(args[2])) {
			options = defaultOptions;
			options.message = args[0];
			options.cancelButtonText = args[1];
			options.actions = args[2];
		}
	}

	return new Promise<string>((resolve, reject) => {
		try {
			let i: number;
			let action: string;
			const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, UIAlertControllerStyle.ActionSheet);

			if (options.actions) {
				for (i = 0; i < options.actions.length; i++) {
					action = options.actions[i];
					if (isString(action)) {
						const thisActionIsDestructive = options.destructiveActionsIndexes && options.destructiveActionsIndexes.indexOf(i) !== -1;
						const dialogType = thisActionIsDestructive ? UIAlertActionStyle.Destructive : UIAlertActionStyle.Default;
						alertController.addAction(
							UIAlertAction.actionWithTitleStyleHandler(action, dialogType, (arg: UIAlertAction) => {
								resolve(arg.title);
							})
						);
					}
				}
			}

			if (isString(options.cancelButtonText)) {
				alertController.addAction(
					UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Cancel, (arg: UIAlertAction) => {
						resolve(arg.title);
					})
				);
			}

			showUIAlertController(alertController);
		} catch (ex) {
			reject(ex);
		}
	});
}

/**
 * Singular rollup for convenience of all dialog methods
 */
export const Dialogs = {
	alert,
	confirm,
	prompt,
	login,
	action,
};
