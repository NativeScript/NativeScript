export * from './dialogs-common';

import { type PromptResult, type LoginResult, type ActionOptions, DialogStrings, isDialogOptions, PromptOptions, inputType, capitalizationType, parseLoginOptions } from './dialogs-common';
import { getCurrentWindowContent, getCurrentWindowBounds } from '../../application/window-helper.windows';
import { Color } from '../../color';

function isString(value: any): value is string {
	return typeof value === 'string';
}

// ContentDialog cannot be used here: the dialog renders but NONE of its callbacks (Closed,
// PrimaryButtonClick, ShowAsync Completed, etc.) reach V8. Event subscription succeeds; the
// templated-popup surface simply never invokes the JsDelegate. Fix: use a plain Popup overlay —
// Popup-hosted Buttons DO fire Click in this host (same pattern as View._showNativeModalView).
const _activeOverlays = new Set<any>();

/** Reads ElementTheme of the current window content: 1 = Light, 2 = Dark, else default(treat as light). */
function isDarkTheme(content: any): boolean {
	try {
		// ElementTheme: Default=0, Light=1, Dark=2
		return content?.ActualTheme === 2;
	} catch (_e) {
		return false;
	}
}

/** Looks up a theme brush from the app resources; falls back to a solid brush of `fallback`. */
function themeBrush(key: string, fallback: Color): Microsoft.UI.Xaml.Media.Brush {
	try {
		const res = (Microsoft.UI.Xaml.Application.Current as any)?.Resources;
		if (res && typeof res.HasKey === 'function' && res.HasKey(key)) {
			const v = res.Lookup(key);
			if (v) {
				return v as Microsoft.UI.Xaml.Media.Brush;
			}
		}
	} catch (_e) {}
	return new Microsoft.UI.Xaml.Media.SolidColorBrush(fallback.windows);
}

interface OverlayButtonSpec {
	text: string;
	isPrimary?: boolean;
	/** Produces the value the dialog promise resolves with when this button is tapped. */
	result: () => any;
}

interface OverlayDialogOptions {
	title?: string;
	message?: string;
	/** Extra content elements (text inputs etc.) inserted between the message and the buttons. */
	extra?: Microsoft.UI.Xaml.UIElement[];
	buttons: OverlayButtonSpec[];
	/** 'row' = right-aligned horizontal footer (alert/confirm/prompt/login); 'stack' = full-width vertical (action). */
	buttonLayout?: 'row' | 'stack';
}

function showOverlayDialog(opts: OverlayDialogOptions): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		try {
			const M = Microsoft.UI.Xaml;
			const content = getCurrentWindowContent<Microsoft.UI.Xaml.FrameworkElement>();
			const xamlRoot = (content as any)?.XamlRoot;
			const dark = isDarkTheme(content);

			const popup = new M.Controls.Primitives.Popup();
			const overlay = new M.Controls.Grid();
			overlay.HorizontalAlignment = 3; // Stretch
			overlay.VerticalAlignment = 3; // Stretch
			overlay.Background = new M.Media.SolidColorBrush(new Color('#99000000').windows); // dim shade

			try {
				const bounds = getCurrentWindowBounds(content as any);
				if (bounds) {
					overlay.Width = bounds.Width;
					overlay.Height = bounds.Height;
				}
			} catch (_e) {}

			const card = new M.Controls.Border();
			card.Background = themeBrush('SolidBackgroundFillColorBaseBrush', new Color(dark ? '#FF2B2B2B' : '#FFFFFFFF'));
			try { card.CornerRadius = M.CornerRadiusHelper.FromUniformRadius(8); } catch (_e) {}
			try { (card as any).Padding = M.ThicknessHelper.FromUniformLength(24); } catch (_e) {}
			card.HorizontalAlignment = 1; // Center
			card.VerticalAlignment = 1; // Center
			try { (card as any).MinWidth = 320; } catch (_e) {}
			try { (card as any).MaxWidth = 460; } catch (_e) {}

			const stack = new M.Controls.StackPanel();
			const kids = (stack as any).Children as Windows.Foundation.Collections.IVector<Microsoft.UI.Xaml.UIElement>;
			const textBrush = themeBrush('TextFillColorPrimaryBrush', new Color(dark ? '#FFFFFFFF' : '#FF000000'));

			if (isString(opts.title) && opts.title.length) {
				const t = new M.Controls.TextBlock();
				(t as any).Text = opts.title;
				(t as any).FontSize = 20;
				(t as any).Foreground = textBrush;
				(t as any).TextWrapping = 2; // WrapWholeWords
				try { (t as any).FontWeight = Microsoft.UI.Text.FontWeights.SemiBold; } catch (_e) {}
				try { (t as any).Margin = M.ThicknessHelper.FromLengths(0, 0, 0, 12); } catch (_e) {}
				kids.Append(t);
			}
			if (isString(opts.message) && opts.message.length) {
				const m = new M.Controls.TextBlock();
				(m as any).Text = opts.message;
				(m as any).Foreground = textBrush;
				(m as any).TextWrapping = 2; // WrapWholeWords
				try { (m as any).Margin = M.ThicknessHelper.FromLengths(0, 0, 0, 12); } catch (_e) {}
				kids.Append(m);
			}
			if (opts.extra) {
				for (const el of opts.extra) {
					try { (el as any).Margin = M.ThicknessHelper.FromLengths(0, 0, 0, 12); } catch (_e) {}
					kids.Append(el);
				}
			}

			let settled = false;
			const close = () => {
				popup.IsOpen = false;
				popup.Child = null;
				overlay.Children.Clear();
				_activeOverlays.delete(popup);
			};
			const settle = (val: any) => {
				if (settled) { return; }
				settled = true;
				close();
				resolve(val);
			};

			// Hold the click delegates + popup alive for the dialog's lifetime (GC guard — mirrors how the
			// modal path keeps its popup on the instance).
			const held: any[] = [];
			(popup as any).__nsHeldDelegates = held;
			_activeOverlays.add(popup);

			const stackButtons = opts.buttonLayout === 'stack';
			const btnRow = new M.Controls.StackPanel();
			(btnRow as any).Orientation = stackButtons ? 0 : 1; // Orientation enum: Vertical = 0, Horizontal = 1
			(btnRow as any).HorizontalAlignment = stackButtons ? 3 : 2; // stack: Stretch, row: Right
			try { (btnRow as any).Spacing = 8; } catch (_e) {}
			const btnKids = (btnRow as any).Children as Windows.Foundation.Collections.IVector<Microsoft.UI.Xaml.UIElement>;

			for (const b of opts.buttons) {
				const btn = new M.Controls.Button();
				(btn as any).Content = b.text;
				if (stackButtons) {
					(btn as any).HorizontalAlignment = 3; // Stretch
				} else {
					try { (btn as any).MinWidth = 90; } catch (_e) {}
				}
				if (b.isPrimary) {
					try {
						const res = (Microsoft.UI.Xaml.Application.Current as any)?.Resources;
						if (res && typeof res.HasKey === 'function' && res.HasKey('AccentButtonStyle')) {
							(btn as any).Style = res.Lookup('AccentButtonStyle');
						}
					} catch (_e) {}
				}
				// Same RoutedEventHandler shape proven to fire inside a Popup.
				const handler = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => settle(b.result()));
				held.push(handler);
				(btn as any).Click = handler as never;
				btnKids.Append(btn);
			}
			kids.Append(btnRow);

			card.Child = stack;
			overlay.Children.Append(card);
			popup.Child = overlay;
			popup.IsLightDismissEnabled = false; // modal — dismissal is via the dialog's own buttons
			if (xamlRoot && typeof (popup as any).XamlRoot !== 'undefined') {
				try { (popup as any).XamlRoot = xamlRoot; } catch (_e) {}
			}
			popup.IsOpen = true;
		} catch (e) {
			reject(e);
		}
	});
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

	return showOverlayDialog({
		title: options.title ?? '',
		message: options.message,
		buttons: [{ text: options.okButtonText ?? DialogStrings.OK, isPrimary: true, result: () => undefined }],
	}).then(() => undefined);
}

export function confirm(arg: any): Promise<boolean> {
	const options = !isDialogOptions(arg)
		? {
			title: DialogStrings.CONFIRM,
			okButtonText: DialogStrings.OK,
			cancelButtonText: DialogStrings.CANCEL,
			message: arg + '',
		}
		: arg;

	const buttons: OverlayButtonSpec[] = [];
	// Neutral button (parity with Android/iOS): resolves undefined.
	if (isString((options as any).neutralButtonText)) {
		buttons.push({ text: (options as any).neutralButtonText, result: () => undefined as never });
	}
	buttons.push({ text: options.cancelButtonText ?? DialogStrings.CANCEL, result: () => false });
	buttons.push({ text: options.okButtonText ?? DialogStrings.OK, isPrimary: true, result: () => true });

	return showOverlayDialog({ title: options.title ?? '', message: options.message, buttons });
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
			let input: Microsoft.UI.Xaml.Controls.Control;
			if (options?.inputType === inputType.password) {
				const pwd = new Microsoft.UI.Xaml.Controls.PasswordBox();
				(pwd as any).PlaceholderText = options.message ?? '';
				if (isString(options.defaultText)) (pwd as any).Password = options.defaultText;
				input = pwd;
			} else {
				const ctrl = new Microsoft.UI.Xaml.Controls.TextBox();
				(ctrl as any).PlaceholderText = options?.message ?? '';
				if (isString(options?.defaultText)) (ctrl as any).Text = options.defaultText;

				try {
					let scopeValue: number | undefined;
					if (options?.inputType === inputType.email) scopeValue = 7; // EmailSmtpAddress
					else if (options?.inputType === inputType.number) scopeValue = 29; // Number
					else if (options?.inputType === inputType.decimal) scopeValue = 8; // Digits
					else if (options?.inputType === inputType.phone) scopeValue = 3; // TelephoneNumber

					if (scopeValue !== undefined) {
						const scope = new Microsoft.UI.Xaml.Input.InputScope();
						const scopeName = new Microsoft.UI.Xaml.Input.InputScopeName();
						(scopeName as any).NameValue = scopeValue;
						((scope as any).Names as Windows.Foundation.Collections.IVector<Microsoft.UI.Xaml.Input.InputScopeName>).Append(scopeName);
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
							(ctrl as any).TextChanged = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.TextChangedEventHandler', (s: any) => {
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
							(ctrl as any).TextChanged = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.TextChangedEventHandler', (s: any) => {
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

			const readText = () => (input instanceof Microsoft.UI.Xaml.Controls.TextBox ? (input as any).Text : (input as any).Password) ?? '';

			showOverlayDialog({
				title: options?.title ?? '',
				message: options?.message,
				extra: [input],
				buttons: [
					{ text: options?.cancelButtonText ?? DialogStrings.CANCEL, result: () => ({ result: false, text: '' }) },
					{ text: options?.okButtonText ?? DialogStrings.OK, isPrimary: true, result: () => ({ result: true, text: readText() }) },
				],
			}).then(resolve, reject);
		} catch (e) {
			reject(e);
		}
	});
}

export function login(...args: any[]): Promise<LoginResult> {
	const options = parseLoginOptions(args);

	return new Promise((resolve, reject) => {
		try {
			const userNameBox = new Microsoft.UI.Xaml.Controls.TextBox();
			(userNameBox as any).PlaceholderText = options.userNameHint ?? '';
			(userNameBox as any).Text = isString(options.userName) ? options.userName : '';

			const passwordBox = new Microsoft.UI.Xaml.Controls.PasswordBox();
			(passwordBox as any).PlaceholderText = options.passwordHint ?? '';
			(passwordBox as any).Password = isString(options.password) ? options.password : '';

			showOverlayDialog({
				title: options.title ?? DialogStrings.LOGIN,
				message: options.message,
				extra: [userNameBox, passwordBox],
				buttons: [
					{ text: options.cancelButtonText ?? DialogStrings.CANCEL, result: () => ({ result: false, userName: '', password: '' }) },
					{ text: options.okButtonText ?? DialogStrings.OK, isPrimary: true, result: () => ({ result: true, userName: (userNameBox as any).Text, password: (passwordBox as any).Password }) },
				],
			}).then(resolve, reject);
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
			const buttons: OverlayButtonSpec[] = [];
			if (options.actions) {
				for (const actionTitle of options.actions) {
					if (!isString(actionTitle)) { continue; }
					buttons.push({ text: actionTitle, result: () => actionTitle });
				}
			}
			if (isString(options.cancelButtonText)) {
				buttons.push({ text: options.cancelButtonText, result: () => options.cancelButtonText ?? '' });
			}

			showOverlayDialog({
				title: options.title,
				message: options.message,
				buttons,
				buttonLayout: 'stack', // full-width vertical list, like an action sheet
			}).then(resolve, reject);
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
