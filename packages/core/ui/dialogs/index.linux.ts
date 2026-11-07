export * from './dialogs-common';

import { type PromptResult, type LoginResult, type ActionOptions, type PromptOptions, type LoginOptions, DialogStrings, isDialogOptions, parseLoginOptions, inputType } from './dialogs-common';
import { isString } from '../../utils/types';
import { connect } from '../../utils/gtk.linux';
import { getPrimaryWindow } from '../../application/window-helper.linux';

const letterReg = /\p{L}/u;
const digitReg = /\p{Nd}/u;
const whiteSpaceReg = /\s/;

export const isLetter = (ch: string) => letterReg.test(ch);
export const isDigit = (ch: string) => digitReg.test(ch);
export const isWhiteSpace = (ch: string) => whiteSpaceReg.test(ch);

interface DialogButton {
	text: string;
	/** "suggested-action" / "destructive-action" */
	style?: string;
	value: any;
}

/**
 * A modal window over the active window: title, message, optional entries and a
 * row of buttons. Resolves with the pressed button's value (closing = cancelValue).
 */
function show<T>(options: { title?: string; message?: string; entries?: any[]; buttons: DialogButton[]; vertical?: boolean; cancelable?: boolean; cancelValue: T; beforeClose?: () => void }): Promise<T> {
	return new Promise<T>((resolve) => {
		const window: any = gtk_window_new();
		const parent = getPrimaryWindow();
		if (parent) {
			gtk_window_set_transient_for(window, parent);
		}
		gtk_window_set_modal(window, 1);
		gtk_window_set_resizable(window, 0);
		gtk_window_set_title(window, options.title || '');
		gtk_window_set_default_size(window, 360, -1);

		const box: any = gtk_box_new(GtkOrientation.VERTICAL, 12);
		for (const side of ['top', 'bottom', 'start', 'end']) {
			(globalThis as any)[`gtk_widget_set_margin_${side}`](box, 18);
		}
		if (options.title) {
			const title: any = gtk_label_new(options.title);
			gtk_widget_add_css_class(title, 'title-3');
			gtk_label_set_wrap(title, 1);
			gtk_label_set_xalign(title, 0);
			gtk_box_append(box, title);
		}
		if (options.message) {
			const message: any = gtk_label_new(options.message);
			gtk_label_set_wrap(message, 1);
			gtk_label_set_xalign(message, 0);
			gtk_box_append(box, message);
		}
		for (const entry of options.entries ?? []) {
			gtk_box_append(box, entry);
		}

		const buttons: any = gtk_box_new(options.vertical ? GtkOrientation.VERTICAL : GtkOrientation.HORIZONTAL, 6);
		if (!options.vertical) {
			gtk_widget_set_halign(buttons, GtkAlign.END);
		}
		gtk_box_append(box, buttons);
		gtk_window_set_child(window, box);

		const disconnects: (() => void)[] = [];
		let primary: any = null;
		let done = false;
		const finish = (value: T) => {
			if (done) return;
			done = true;
			options.beforeClose?.();
			for (const d of disconnects) d();
			gtk_window_destroy(window);
			resolve(value);
		};
		for (const spec of options.buttons) {
			const button: any = gtk_button_new_with_label(spec.text);
			if (spec.style) {
				gtk_widget_add_css_class(button, spec.style);
			}
			disconnects.push(connect(button, 'clicked', () => finish(spec.value)));
			gtk_box_append(buttons, button);
			// Return presses the primary button
			if (spec.style === 'suggested-action') {
				gtk_window_set_default_widget(window, button);
				primary = button;
			}
		}
		disconnects.push(
			connect(
				window,
				'close-request',
				() => {
					if (options.cancelable === false) {
						return true;
					}
					finish(options.cancelValue);
					return true;
				},
				{ returnsBool: true },
			),
		);
		gtk_window_present(window);
		const focus = options.entries?.[0] ?? primary;
		if (focus) {
			gtk_widget_grab_focus(focus);
		}
	});
}

function entry(text: string, hint: string, password = false, type?: string): any {
	const widget: any = gtk_entry_new();
	gtk_entry_set_activates_default(widget, 1);
	gtk_editable_set_text(widget, text ?? '');
	if (hint) {
		gtk_entry_set_placeholder_text(widget, hint);
	}
	if (password || type === inputType.password) {
		gtk_entry_set_visibility(widget, 0);
		gtk_entry_set_input_purpose(widget, GtkInputPurpose.PASSWORD);
	} else if (type === inputType.email) {
		gtk_entry_set_input_purpose(widget, GtkInputPurpose.EMAIL);
	} else if (type === inputType.number || type === inputType.decimal) {
		gtk_entry_set_input_purpose(widget, GtkInputPurpose.NUMBER);
	} else if (type === inputType.phone) {
		gtk_entry_set_input_purpose(widget, GtkInputPurpose.PHONE);
	}
	return widget;
}

function confirmButtons(options: { okButtonText?: string; cancelButtonText?: string; neutralButtonText?: string }, ok: any, cancel: any, neutral: any): DialogButton[] {
	const buttons: DialogButton[] = [];
	if (options.neutralButtonText) buttons.push({ text: options.neutralButtonText, value: neutral });
	if (options.cancelButtonText) buttons.push({ text: options.cancelButtonText, value: cancel });
	buttons.push({ text: options.okButtonText || DialogStrings.OK, style: 'suggested-action', value: ok });
	return buttons;
}

export function alert(arg: any): Promise<void> {
	const options = isDialogOptions(arg) ? arg : { title: DialogStrings.ALERT, okButtonText: DialogStrings.OK, message: `${arg}` };
	return show<void>({ title: options.title, message: options.message, cancelable: options.cancelable, buttons: [{ text: options.okButtonText || DialogStrings.OK, style: 'suggested-action', value: undefined }], cancelValue: undefined });
}

export function confirm(arg: any): Promise<boolean> {
	const options = isDialogOptions(arg) ? arg : { title: DialogStrings.CONFIRM, okButtonText: DialogStrings.OK, cancelButtonText: DialogStrings.CANCEL, message: `${arg}` };
	return show<boolean>({ title: options.title, message: options.message, cancelable: options.cancelable, buttons: confirmButtons(options, true, false, undefined), cancelValue: false });
}

export function prompt(...args: any[]): Promise<PromptResult> {
	let options: PromptOptions = { title: DialogStrings.PROMPT, okButtonText: DialogStrings.OK, cancelButtonText: DialogStrings.CANCEL, inputType: inputType.text };
	if (args.length === 1 && !isString(args[0])) {
		options = args[0];
	} else {
		options = { ...options, message: args[0], defaultText: isString(args[1]) ? args[1] : '' };
	}
	const field = entry(options.defaultText, '', false, options.inputType);
	let text = '';
	return show<any>({
		title: options.title,
		message: options.message,
		entries: [field],
		cancelable: options.cancelable,
		buttons: confirmButtons(options, 'ok', 'cancel', 'neutral'),
		cancelValue: 'cancel',
		beforeClose: () => (text = gtk_editable_get_text(field) ?? ''),
	}).then((pressed: any) => ({ result: pressed === 'ok' ? true : pressed === 'cancel' ? false : undefined, text }));
}

export function login(...args: any[]): Promise<LoginResult> {
	const options: LoginOptions = parseLoginOptions(args);
	const user = entry(options.userName, options.userNameHint);
	const password = entry(options.password, options.passwordHint, true);
	const values = { userName: '', password: '' };
	return show<any>({
		title: options.title,
		message: options.message,
		entries: [user, password],
		cancelable: options.cancelable,
		buttons: confirmButtons(options, 'ok', 'cancel', 'neutral'),
		cancelValue: 'cancel',
		beforeClose: () => {
			values.userName = gtk_editable_get_text(user) ?? '';
			values.password = gtk_editable_get_text(password) ?? '';
		},
	}).then((pressed: any) => ({ result: pressed === 'ok' ? true : pressed === 'cancel' ? false : undefined, ...values }));
}

export function action(...args: any[]): Promise<string> {
	let options: ActionOptions = { title: null, cancelButtonText: DialogStrings.CANCEL };
	if (args.length === 1 && !isString(args[0])) {
		options = args[0];
	} else {
		options = { ...options, message: args[0], cancelButtonText: isString(args[1]) ? args[1] : options.cancelButtonText, actions: args[2] ?? [] };
	}
	const destructive = new Set(options.destructiveActionsIndexes ?? []);
	const buttons: DialogButton[] = (options.actions ?? []).map((text, i) => ({ text, value: text, style: destructive.has(i) ? 'destructive-action' : undefined }));
	if (options.cancelButtonText) {
		buttons.push({ text: options.cancelButtonText, value: options.cancelButtonText });
	}
	return show<string>({ title: options.title, message: options.message, buttons, vertical: true, cancelable: options.cancelable, cancelValue: options.cancelButtonText ?? DialogStrings.CANCEL });
}

export const Dialogs = { alert, confirm, prompt, login, action };
