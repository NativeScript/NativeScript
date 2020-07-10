/**
 * Android specific dialogs functions implementation.
 */
import { DialogOptions, ConfirmOptions, PromptOptions, PromptResult, LoginOptions, LoginResult, ActionOptions } from './dialogs-common';
import { getLabelColor, getButtonColors, isDialogOptions, inputType, capitalizationType, DialogStrings, parseLoginOptions } from './dialogs-common';
import { android as androidApp } from '../../application';

export * from './dialogs-common';

function isString(value): value is string {
	return typeof value === 'string';
}

function createAlertDialog(options?: DialogOptions): android.app.AlertDialog.Builder {
	const alert = new android.app.AlertDialog.Builder(androidApp.foregroundActivity);
	alert.setTitle(options && isString(options.title) ? options.title : '');
	alert.setMessage(options && isString(options.message) ? options.message : '');
	if (options && options.cancelable === false) {
		alert.setCancelable(false);
	}

	return alert;
}

function showDialog(builder: android.app.AlertDialog.Builder) {
	const dlg = builder.show();

	const labelColor = getLabelColor();
	if (labelColor) {
		const textViewId = dlg.getContext().getResources().getIdentifier('android:id/alertTitle', null, null);
		if (textViewId) {
			const tv = <android.widget.TextView>dlg.findViewById(textViewId);
			if (tv) {
				tv.setTextColor(labelColor.android);
			}
		}

		const messageTextViewId = dlg.getContext().getResources().getIdentifier('android:id/message', null, null);
		if (messageTextViewId) {
			const messageTextView = <android.widget.TextView>dlg.findViewById(messageTextViewId);
			if (messageTextView) {
				messageTextView.setTextColor(labelColor.android);
			}
		}
	}

	let { color, backgroundColor } = getButtonColors();

	if (color) {
		let buttons: android.widget.Button[] = [];
		for (let i = 0; i < 3; i++) {
			let id = dlg
				.getContext()
				.getResources()
				.getIdentifier('android:id/button' + i, null, null);
			buttons[i] = <android.widget.Button>dlg.findViewById(id);
		}

		buttons.forEach((button) => {
			if (button) {
				if (color) {
					button.setTextColor(color.android);
				}
				if (backgroundColor) {
					button.setBackgroundColor(backgroundColor.android);
				}
			}
		});
	}
}

function addButtonsToAlertDialog(alert: android.app.AlertDialog.Builder, options: ConfirmOptions, callback: Function): void {
	if (!options) {
		return;
	}

	if (options.okButtonText) {
		alert.setPositiveButton(
			options.okButtonText,
			new android.content.DialogInterface.OnClickListener({
				onClick: function (dialog: android.content.DialogInterface, id: number) {
					dialog.cancel();
					callback(true);
				},
			})
		);
	}

	if (options.cancelButtonText) {
		alert.setNegativeButton(
			options.cancelButtonText,
			new android.content.DialogInterface.OnClickListener({
				onClick: function (dialog: android.content.DialogInterface, id: number) {
					dialog.cancel();
					callback(false);
				},
			})
		);
	}

	if (options.neutralButtonText) {
		alert.setNeutralButton(
			options.neutralButtonText,
			new android.content.DialogInterface.OnClickListener({
				onClick: function (dialog: android.content.DialogInterface, id: number) {
					dialog.cancel();
					callback(undefined);
				},
			})
		);
	}
	alert.setOnDismissListener(
		new android.content.DialogInterface.OnDismissListener({
			onDismiss: function () {
				callback(false);
			},
		})
	);
}

export function alert(arg: any): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		try {
			const options = !isDialogOptions(arg) ? { title: DialogStrings.ALERT, okButtonText: DialogStrings.OK, message: arg + '' } : arg;

			const alert = createAlertDialog(options);

			alert.setPositiveButton(
				options.okButtonText,
				new android.content.DialogInterface.OnClickListener({
					onClick: function (dialog: android.content.DialogInterface, id: number) {
						dialog.cancel();
						resolve();
					},
				})
			);
			alert.setOnDismissListener(
				new android.content.DialogInterface.OnDismissListener({
					onDismiss: function () {
						resolve();
					},
				})
			);

			showDialog(alert);
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
			const alert = createAlertDialog(options);

			addButtonsToAlertDialog(alert, options, function (result) {
				resolve(result);
			});

			showDialog(alert);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function prompt(arg: any): Promise<PromptResult> {
	let options: PromptOptions;

	const defaultOptions = {
		title: DialogStrings.PROMPT,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
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
			const alert = createAlertDialog(options);

			const input = new android.widget.EditText(androidApp.foregroundActivity);

			if (options) {
				if (options.inputType === inputType.password) {
					input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
				} else if (options.inputType === inputType.email) {
					input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
				} else if (options.inputType === inputType.number) {
					input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
				} else if (options.inputType === inputType.decimal) {
					input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
				} else if (options.inputType === inputType.phone) {
					input.setInputType(android.text.InputType.TYPE_CLASS_PHONE);
				}

				switch (options.capitalizationType) {
					case capitalizationType.all: {
						input.setInputType(input.getInputType() | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
						break;
					}
					case capitalizationType.sentences: {
						input.setInputType(input.getInputType() | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
						break;
					}
					case capitalizationType.words: {
						input.setInputType(input.getInputType() | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS);
						break;
					}
				}
			}

			input.setText((options && options.defaultText) || '');

			alert.setView(input);

			const getText = function () {
				return input.getText().toString();
			};

			addButtonsToAlertDialog(alert, options, function (r) {
				resolve({ result: r, text: getText() });
			});

			showDialog(alert);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function login(...args: any[]): Promise<LoginResult> {
	let options: LoginOptions = parseLoginOptions(args);

	return new Promise<LoginResult>((resolve, reject) => {
		try {
			const context = androidApp.foregroundActivity;

			const alert = createAlertDialog(options);

			const userNameInput = new android.widget.EditText(context);

			userNameInput.setHint(options.userNameHint ? options.userNameHint : '');
			userNameInput.setText(options.userName ? options.userName : '');

			const passwordInput = new android.widget.EditText(context);
			passwordInput.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
			passwordInput.setTypeface(android.graphics.Typeface.DEFAULT);

			passwordInput.setHint(options.passwordHint ? options.passwordHint : '');
			passwordInput.setText(options.password ? options.password : '');

			const layout = new android.widget.LinearLayout(context);
			layout.setOrientation(1);
			layout.addView(userNameInput);
			layout.addView(passwordInput);

			alert.setView(layout);

			addButtonsToAlertDialog(alert, options, function (r) {
				resolve({
					result: r,
					userName: userNameInput.getText().toString(),
					password: passwordInput.getText().toString(),
				});
			});

			showDialog(alert);
		} catch (ex) {
			reject(ex);
		}
	});
}

export function action(arg: any): Promise<string> {
	let options: ActionOptions;

	const defaultOptions = { title: null, cancelButtonText: DialogStrings.CANCEL };

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
		if (isString(arguments[0]) && isString(arguments[1]) && typeof arguments[2] !== 'undefined') {
			options = defaultOptions;
			options.message = arguments[0];
			options.cancelButtonText = arguments[1];
			options.actions = arguments[2];
		}
	}

	return new Promise<string>((resolve, reject) => {
		try {
			const activity = androidApp.foregroundActivity || androidApp.startActivity;
			const alert = new android.app.AlertDialog.Builder(activity);
			const message = options && isString(options.message) ? options.message : '';
			const title = options && isString(options.title) ? options.title : '';
			if (options && options.cancelable === false) {
				alert.setCancelable(false);
			}

			if (title) {
				alert.setTitle(title);
				if (!options.actions) {
					alert.setMessage(message);
				}
			} else {
				alert.setTitle(message);
			}

			if (options.actions) {
				alert.setItems(
					options.actions,
					new android.content.DialogInterface.OnClickListener({
						onClick: function (dialog: android.content.DialogInterface, which: number) {
							resolve(options.actions[which]);
						},
					})
				);
			}

			if (isString(options.cancelButtonText)) {
				alert.setNegativeButton(
					options.cancelButtonText,
					new android.content.DialogInterface.OnClickListener({
						onClick: function (dialog: android.content.DialogInterface, id: number) {
							dialog.cancel();
							resolve(options.cancelButtonText);
						},
					})
				);
			}

			alert.setOnDismissListener(
				new android.content.DialogInterface.OnDismissListener({
					onDismiss: function () {
						if (isString(options.cancelButtonText)) {
							resolve(options.cancelButtonText);
						} else {
							resolve('');
						}
					},
				})
			);

			showDialog(alert);
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
