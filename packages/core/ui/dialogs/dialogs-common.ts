// Types.
import { View } from '../core/view';
import { Color } from '../../color';
import { Page } from '../page';
import { Frame } from '../frame';
import { CSSUtils } from '../../css/system-classes';
import { isObject, isString } from '../../utils/types';
import { Button } from '../button';
import { Label } from '../label';
import { TextField } from '../text-field';

const CSS_CLASS = `${CSSUtils.CLASS_PREFIX}dialog-item`;

export namespace DialogStrings {
	export const STRING = 'string';
	export const PROMPT = 'Prompt';
	export const CONFIRM = 'Confirm';
	export const ALERT = 'Alert';
	export const LOGIN = 'Login';
	export const OK = 'OK';
	export const CANCEL = 'Cancel';
}

/**
 * Provides options for the dialog.
 */
export interface CancelableOptions {
	/**
	 * [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
	 */
	cancelable?: boolean;

	/**
	 * [Android only] Sets the theme of the Dialog. Usable themes can be found: https://developer.android.com/reference/android/R.style
	 */
	theme?: number;
}

/**
 * Provides options for the dialog.
 */
export interface ActionOptions extends CancelableOptions {
	/**
	 * Gets or sets the dialog title.
	 */
	title?: string;

	/**
	 * Gets or sets the dialog message.
	 */
	message?: string;

	/**
	 * Gets or sets the Cancel button text.
	 */
	cancelButtonText?: string;

	/**
	 * Gets or sets the list of available actions.
	 */
	actions?: Array<string>;

	/**
	 * [iOS only] Gets or sets the indexes of destructive actions.
	 */
	destructiveActionsIndexes?: Array<number>;
}

/**
 * Provides options for the dialog.
 */
export interface DialogOptions extends CancelableOptions {
	/**
	 * Gets or sets the dialog title.
	 */
	title?: string;

	/**
	 * Gets or sets the dialog message.
	 */
	message?: string;
}

/**
 * Provides options for the alert.
 */
export interface AlertOptions extends DialogOptions {
	/**
	 * Gets or sets the OK button text.
	 */
	okButtonText?: string;
}

/**
 * Provides options for the confirm dialog.
 */
export interface ConfirmOptions extends AlertOptions {
	/**
	 * Gets or sets the Cancel button text.
	 */
	cancelButtonText?: string;

	/**
	 * Gets or sets the neutral button text.
	 */
	neutralButtonText?: string;
}

/**
 * Provides options for the prompt dialog.
 */
export interface PromptOptions extends ConfirmOptions {
	/**
	 * Gets or sets the default text to display in the input box.
	 */
	defaultText?: string;

	/**
	 * Gets or sets the prompt input type (plain text, password, or email).
	 */
	inputType?: string;

	/**
	 * Gets or sets the prompt capitalizationType (none, all, sentences, or words).
	 */
	capitalizationType?: string;
}

/**
 * Provides result data from the prompt dialog.
 */
export interface PromptResult {
	/**
	 * Gets or sets the prompt dialog boolean result.
	 */
	result: boolean;

	/**
	 *  Gets or sets the text entered in the prompt dialog.
	 */
	text: string;
}

/**
 * Provides result data from the login dialog.
 */
export interface LoginResult {
	/**
	 * Gets or sets the login dialog boolean result.
	 */
	result: boolean;

	/**
	 *  Gets or sets the user entered in the login dialog.
	 */
	userName: string;

	/**
	 *  Gets or sets the password entered in the login dialog.
	 */
	password: string;
}

/**
 * Provides options for the login dialog.
 */
export interface LoginOptions extends ConfirmOptions {
	/**
	 * Gets or sets the default text to display as hint in the user name input box.
	 */
	userNameHint?: string;

	/**
	 * Gets or sets the default text to display as hint in the password input box.
	 */
	passwordHint?: string;

	/**
	 * Gets or sets the default text to display in the user name input box.
	 */
	userName?: string;

	/**
	 * Gets or sets the default text to display in the password input box.
	 */
	password?: string;
}

/**
 * Defines the input type for prompt dialog.
 */
export namespace inputType {
	/**
	 * Plain text input type.
	 */
	export const text = 'text';

	/**
	 * Password input type.
	 */
	export const password = 'password';

	/**
	 * Email input type.
	 */
	export const email = 'email';

	/**
	 * Number input type
	 */
	export const number = 'number';

	/**
	 * Decimal input type
	 */
	export const decimal = 'decimal';

	/**
	 * Phone input type
	 */
	export const phone = 'phone';
}

/**
 * Defines the capitalization type for prompt dialog.
 */
export namespace capitalizationType {
	/**
	 * No automatic capitalization.
	 */
	export const none = 'none';

	/**
	 * Capitalizes every character.
	 */
	export const all = 'all';

	/**
	 * Capitalize the first word of each sentence.
	 */
	export const sentences = 'sentences';

	/**
	 * Capitalize the first letter of every word.
	 */
	export const words = 'words';
}

export function getCurrentPage(): Page {
	const topmostFrame = Frame.topmost();
	if (topmostFrame) {
		return topmostFrame.currentPage;
	}

	return undefined;
}

function applySelectors<T extends View>(view: T, callback: (view: T) => void) {
	const currentPage = getCurrentPage();
	if (currentPage) {
		const styleScope = currentPage._styleScope;
		if (styleScope) {
			view.parent = currentPage;
			view._inheritStyleScope(styleScope);
			view.onLoaded();
			callback(view);
			view.onUnloaded();
		}
	}
}

let button: View;
let label: View;
let textField: View;

export function getButtonColors(): { color: Color; backgroundColor: Color } {
	if (!button) {
		button = new Button();
		button.className = CSS_CLASS;
		if (__APPLE__) {
			button._setupUI(<any>{});
		}
	}

	let buttonColor: Color;
	let buttonBackgroundColor: Color;
	applySelectors(button, (btn) => {
		buttonColor = btn.color;
		buttonBackgroundColor = <Color>btn.backgroundColor;
	});

	return { color: buttonColor, backgroundColor: buttonBackgroundColor };
}

export function getLabelColor(): Color {
	if (!label) {
		label = new Label();
		label.className = CSS_CLASS;
		if (__APPLE__) {
			label._setupUI(<any>{});
		}
	}

	let labelColor: Color;
	applySelectors(label, (lbl) => {
		labelColor = lbl.color;
	});

	return labelColor;
}

export function getTextFieldColor(): Color {
	if (!textField) {
		textField = new TextField();
		textField.className = CSS_CLASS;
		if (__APPLE__) {
			textField._setupUI(<any>{});
		}
	}

	let textFieldColor: Color;
	applySelectors(textField, (tf) => {
		textFieldColor = tf.color;
	});

	return textFieldColor;
}

export function isDialogOptions(arg): boolean {
	return arg && (arg.message || arg.title);
}

export function parseLoginOptions(args: any[]): LoginOptions {
	// Handle options object first
	if (args.length === 1 && isObject(args[0])) {
		return args[0];
	}

	const options: LoginOptions = {
		title: DialogStrings.LOGIN,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
	};

	if (isString(args[0])) {
		options.message = args[0];
	}

	if (isString(args[1])) {
		options.userNameHint = args[1];
	}

	if (isString(args[2])) {
		options.passwordHint = args[2];
	}

	if (isString(args[3])) {
		options.userName = args[3];
	}

	if (isString(args[4])) {
		options.password = args[4];
	}

	return options;
}
