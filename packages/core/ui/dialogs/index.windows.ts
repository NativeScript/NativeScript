export * from './dialogs-common';

import { type PromptResult, type LoginResult, type ActionOptions, DialogStrings, isDialogOptions, PromptOptions, inputType, capitalizationType, parseLoginOptions } from './dialogs-common';

function isString(value: any): value is string {
	return typeof value === 'string';
}

const letterReg = /\p{L}/u;
const digitReg = /\p{N}/u;
const whiteSpaceReg = /\s/;

export const isLetter = (ch: string) => letterReg.test(ch);
export const isDigit = (ch: string) => digitReg.test(ch);
export const isWhiteSpace = (ch: string) => whiteSpaceReg.test(ch);

function capitalizeSentences(text: string): string {
	let result = '';
	let capitalize = true;
	let afterPunct = false;
	let changed = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (capitalize && isLetter(ch)) {
			const upper = ch.toUpperCase();
			if (upper !== ch) changed = true;
			result += upper;
			capitalize = false;
			afterPunct = false;
		} else {
			result += ch;
			if (ch === '.' || ch === '!' || ch === '?') afterPunct = true;
			else if (afterPunct && isWhiteSpace(ch)) capitalize = true;
			else if (!isWhiteSpace(ch)) afterPunct = false;
		}
	}
	return changed ? result : text;
}

function capitalizeWords(text: string): string {
	let result = '';
	let capitalize = true;
	let changed = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (capitalize && isLetter(ch)) {
			const upper = ch.toUpperCase();
			if (upper !== ch) changed = true;
			result += upper;
			capitalize = false;
		} else {
			result += ch;
			capitalize = isWhiteSpace(ch);
		}
	}
	return changed ? result : text;
}

export function alert(arg: any): Promise<void> {
	const options = !isDialogOptions(arg) ? { title: DialogStrings.ALERT, okButtonText: DialogStrings.OK, message: arg + '' } : arg;
	const dialog = new Windows.UI.Popups.MessageDialog(options.message, options.title);
	return NSWinRT.toPromise(dialog.ShowAsync()) as Promise<void>;
}

export function confirm(arg: any): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const options = !isDialogOptions(arg)
			? {
				title: DialogStrings.CONFIRM,
				okButtonText: DialogStrings.OK,
				cancelButtonText: DialogStrings.CANCEL,
				message: arg + '',
			}
			: arg;

		try {
			const dialog = new Windows.UI.Popups.MessageDialog(options.message, options.title);
			const commands = dialog.Commands as Windows.Foundation.Collections.IVector<Windows.UI.Popups.IUICommand>;

			const ok = new Windows.UI.Popups.UICommand(options.okButtonText);
			(ok as any).Invoked = NSWinRT.asDelegate(() => resolve(true));
			commands.Append(ok);

			const cancel = new Windows.UI.Popups.UICommand(options.cancelButtonText);
			(cancel as any).Invoked = NSWinRT.asDelegate(() => resolve(false));
			commands.Append(cancel);

			dialog.DefaultCommandIndex = 0;
			dialog.CancelCommandIndex = 1;

			NSWinRT.toPromise(dialog.ShowAsync()).catch(reject);
		} catch (e) {
			reject(e);
		}
	});
}

export function prompt(...args: any[]): Promise<PromptResult> {
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

	return new Promise((resolve, reject) => {
		try {
			const inputDialog = new Windows.UI.Xaml.Controls.ContentDialog();
			(inputDialog as any).Title = options?.title ?? '';

			const stack = new Windows.UI.Xaml.Controls.StackPanel();
			const children = (stack as any).Children as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.UIElement>;

			if (options?.message) {
				const msg = new Windows.UI.Xaml.Controls.TextBlock();
				(msg as any).Text = options.message;
				(msg as any).TextWrapping = 2; // WrapWholeWords
				children.Append(msg);
			}

			let input: Windows.UI.Xaml.Controls.Control;
			if (options?.inputType === inputType.password) {
				const pwd = new Windows.UI.Xaml.Controls.PasswordBox();
				(pwd as any).PlaceholderText = options.message ?? '';
				if (isString(options.defaultText)) (pwd as any).Password = options.defaultText;
				input = pwd;
			} else {
				const ctrl = new Windows.UI.Xaml.Controls.TextBox();
				(ctrl as any).PlaceholderText = options?.message ?? '';
				if (isString(options?.defaultText)) (ctrl as any).Text = options.defaultText;

				try {
					let scopeValue: number | undefined;
					if (options?.inputType === inputType.email) scopeValue = 7; // EmailSmtpAddress
					else if (options?.inputType === inputType.number) scopeValue = 29; // Number
					else if (options?.inputType === inputType.decimal) scopeValue = 8; // Digits
					else if (options?.inputType === inputType.phone) scopeValue = 3; // TelephoneNumber

					if (scopeValue !== undefined) {
						const scope = new Windows.UI.Xaml.Input.InputScope();
						const scopeName = new Windows.UI.Xaml.Input.InputScopeName();
						(scopeName as any).NameValue = scopeValue;
						((scope as any).Names as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.Input.InputScopeName>).Append(scopeName);
						(ctrl as any).InputScope = scope;
					}
				} catch (_e) {}

				try {
					switch (options?.capitalizationType) {
						case capitalizationType.all:
							(ctrl as any).CharacterCasing = 1; // Upper
							break;
						case capitalizationType.sentences: {
							let updatingSentences = false;
							(ctrl as any).TextChanged = NSWinRT.asDelegate('Windows.UI.Xaml.Controls.TextChangedEventHandler', (s: any) => {
								if (updatingSentences) return;
								const text: string = s?.Text;
								if (!text) return;
								const transformed = capitalizeSentences(text);
								if (transformed !== text) {
									updatingSentences = true;
									const sel = s.SelectionStart;
									s.Text = transformed;
									s.SelectionStart = sel;
									updatingSentences = false;
								}
							});
							break;
						}
						case capitalizationType.words: {
							let updatingWords = false;
							(ctrl as any).TextChanged = NSWinRT.asDelegate('Windows.UI.Xaml.Controls.TextChangedEventHandler', (s: any) => {
								if (updatingWords) return;
								const text: string = s?.Text;
								if (!text) return;
								const transformed = capitalizeWords(text);
								if (transformed !== text) {
									updatingWords = true;
									const sel = s.SelectionStart;
									s.Text = transformed;
									s.SelectionStart = sel;
									updatingWords = false;
								}
							});
							break;
						}
					}
				} catch (_e) {}

				input = ctrl;
			}

			children.Append(input);
			(inputDialog as any).Content = stack;
			(inputDialog as any).PrimaryButtonText = options?.okButtonText ?? DialogStrings.OK;
			(inputDialog as any).CloseButtonText = options?.cancelButtonText ?? DialogStrings.CANCEL;

			(inputDialog as any).PrimaryButtonClick = NSWinRT.asDelegate(() => {
				const text = input instanceof Windows.UI.Xaml.Controls.TextBox
					? (input as any).Text
					: (input as any).Password;
				resolve({ result: true, text: text ?? '' });
			});
			(inputDialog as any).CloseButtonClick = NSWinRT.asDelegate(() => {
				resolve({ result: false, text: '' });
			});

			NSWinRT.toPromise((inputDialog as any).ShowAsync()).catch(reject);
		} catch (e) {
			reject(e);
		}
	});
}

export function login(...args: any[]): Promise<LoginResult> {
	const options = parseLoginOptions(args);

	return new Promise((resolve, reject) => {
		try {
			const dialog = new Windows.UI.Xaml.Controls.ContentDialog();
			(dialog as any).Title = options.title ?? DialogStrings.LOGIN;

			const stack = new Windows.UI.Xaml.Controls.StackPanel();
			const children = (stack as any).Children as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.UIElement>;

			const userNameBox = new Windows.UI.Xaml.Controls.TextBox();
			(userNameBox as any).PlaceholderText = options.userNameHint ?? '';
			(userNameBox as any).Text = isString(options.userName) ? options.userName : '';
			children.Append(userNameBox);

			const passwordBox = new Windows.UI.Xaml.Controls.PasswordBox();
			(passwordBox as any).PlaceholderText = options.passwordHint ?? '';
			(passwordBox as any).Password = isString(options.password) ? options.password : '';
			children.Append(passwordBox);

			(dialog as any).Content = stack;
			(dialog as any).PrimaryButtonText = options.okButtonText ?? DialogStrings.OK;
			(dialog as any).CloseButtonText = options.cancelButtonText ?? DialogStrings.CANCEL;

			(dialog as any).PrimaryButtonClick = NSWinRT.asDelegate(() => {
				resolve({ result: true, userName: (userNameBox as any).Text, password: (passwordBox as any).Password });
			});
			(dialog as any).CloseButtonClick = NSWinRT.asDelegate(() => {
				resolve({ result: false, userName: '', password: '' });
			});

			NSWinRT.toPromise((dialog as any).ShowAsync()).catch(reject);
		} catch (e) {
			reject(e);
		}
	});
}

export function action(...args: any[]): Promise<string> {
	let options: ActionOptions;

	const defaultOptions: ActionOptions = { title: undefined, cancelButtonText: DialogStrings.CANCEL };

	if (args.length === 1) {
		if (isString(args[0])) {
			options = { ...defaultOptions, message: args[0] };
		} else {
			options = args[0];
		}
	} else if (args.length === 2) {
		if (isString(args[0]) && isString(args[1])) {
			options = { ...defaultOptions, message: args[0], cancelButtonText: args[1] };
		}
	} else if (args.length === 3) {
		if (isString(args[0]) && isString(args[1])) {
			options = { ...defaultOptions, message: args[0], cancelButtonText: args[1], actions: args[2] };
		}
	}

	return new Promise((resolve, reject) => {
		try {
			const dialog = new Windows.UI.Xaml.Controls.ContentDialog();
			if (options.title) (dialog as any).Title = options.title;

			const stack = new Windows.UI.Xaml.Controls.StackPanel();
			const children = (stack as any).Children as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.UIElement>;

			if (options.message) {
				const msg = new Windows.UI.Xaml.Controls.TextBlock();
				(msg as any).Text = options.message;
				children.Append(msg);
			}

			let resolved = false;
			if (options.actions) {
				for (const actionTitle of options.actions) {
					if (!isString(actionTitle)) continue;
					const btn = new Windows.UI.Xaml.Controls.Button();
					(btn as any).Content = actionTitle;
					(btn as any).HorizontalAlignment = 3; // Stretch
					const handler = NSWinRT.asDelegate(() => {
						if (!resolved) {
							resolved = true;
							resolve(actionTitle);
							(dialog as any).Hide();
						}
					});
					(btn as any).Click = handler;
					children.Append(btn);
				}
			}

			(dialog as any).Content = stack;

			if (isString(options.cancelButtonText)) {
				(dialog as any).CloseButtonText = options.cancelButtonText;
				(dialog as any).CloseButtonClick = NSWinRT.asDelegate(() => {
					if (!resolved) {
						resolved = true;
						resolve(options.cancelButtonText ?? '');
					}
				});
			}

			NSWinRT.toPromise((dialog as any).ShowAsync()).catch(reject);
		} catch (e) {
			reject(e);
		}
	});
}

export const Dialogs = {
	alert,
	confirm,
	prompt,
	login,
	action,
};
