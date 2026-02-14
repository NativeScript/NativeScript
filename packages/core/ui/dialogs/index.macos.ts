export namespace DialogStrings {
	export const STRING = 'string';
	export const PROMPT = 'Prompt';
	export const CONFIRM = 'Confirm';
	export const ALERT = 'Alert';
	export const LOGIN = 'Login';
	export const OK = 'OK';
	export const CANCEL = 'Cancel';
}

export namespace inputType {
	export const text = 'text';
	export const password = 'password';
	export const email = 'email';
	export const number = 'number';
	export const decimal = 'decimal';
	export const phone = 'phone';
}

export namespace capitalizationType {
	export const none = 'none';
	export const all = 'all';
	export const sentences = 'sentences';
	export const words = 'words';
}

function normalizeDialogOptions(arg: any, defaults: Record<string, any>) {
	if (!arg || typeof arg !== 'object') {
		return {
			...defaults,
			message: `${arg ?? ''}`,
		};
	}
	return {
		...defaults,
		...arg,
	};
}

function runModalAlert(title: string, message: string, buttons: string[]): number {
	const alert = NSAlert.alloc().init() as NSAlert;
	alert.messageText = title || '';
	alert.informativeText = message || '';
	for (const button of buttons) {
		alert.addButtonWithTitle(button);
	}
	return alert.runModal();
}

export function alert(arg: any): Promise<void> {
	const options = normalizeDialogOptions(arg, {
		title: DialogStrings.ALERT,
		okButtonText: DialogStrings.OK,
	});
	runModalAlert(options.title, options.message, [options.okButtonText]);
	return Promise.resolve();
}

export function confirm(arg: any): Promise<boolean> {
	const options = normalizeDialogOptions(arg, {
		title: DialogStrings.CONFIRM,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
	});
	const result = runModalAlert(options.title, options.message, [options.okButtonText, options.cancelButtonText]);
	return Promise.resolve(result === NSAlertFirstButtonReturn);
}

export function prompt(arg: any): Promise<{ result: boolean; text: string }> {
	const options = normalizeDialogOptions(arg, {
		title: DialogStrings.PROMPT,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
		defaultText: '',
	});

	const alert = NSAlert.alloc().init() as NSAlert;
	alert.messageText = options.title || '';
	alert.informativeText = options.message || '';
	alert.addButtonWithTitle(options.okButtonText);
	alert.addButtonWithTitle(options.cancelButtonText);

	const textField = (NSTextField.alloc() as unknown as NSTextField).initWithFrame(NSMakeRect(0, 0, 260, 24));
	textField.stringValue = options.defaultText || '';
	alert.accessoryView = textField;

	const result = alert.runModal() === NSAlertFirstButtonReturn;
	return Promise.resolve({ result, text: textField.stringValue });
}

export function login(arg: any): Promise<{ result: boolean; userName: string; password: string }> {
	const options = normalizeDialogOptions(arg, {
		title: DialogStrings.LOGIN,
		okButtonText: DialogStrings.OK,
		cancelButtonText: DialogStrings.CANCEL,
		userName: '',
		password: '',
	});

	const alert = NSAlert.alloc().init() as NSAlert;
	alert.messageText = options.title || '';
	alert.informativeText = options.message || '';
	alert.addButtonWithTitle(options.okButtonText);
	alert.addButtonWithTitle(options.cancelButtonText);

	const container = (NSStackView.alloc() as unknown as NSStackView).initWithFrame(NSMakeRect(0, 0, 260, 52));
	container.orientation = NSUserInterfaceLayoutOrientation.Vertical;
	container.spacing = 8;

	const userField = (NSTextField.alloc() as unknown as NSTextField).initWithFrame(NSMakeRect(0, 0, 260, 24));
	userField.placeholderString = options.userNameHint || '';
	userField.stringValue = options.userName || '';

	const passwordField = (NSSecureTextField.alloc() as unknown as NSSecureTextField).initWithFrame(NSMakeRect(0, 0, 260, 24));
	passwordField.placeholderString = options.passwordHint || '';
	passwordField.stringValue = options.password || '';

	container.addArrangedSubview(userField);
	container.addArrangedSubview(passwordField);
	alert.accessoryView = container;

	const ok = alert.runModal() === NSAlertFirstButtonReturn;
	return Promise.resolve({ result: ok, userName: userField.stringValue, password: passwordField.stringValue });
}

export function action(arg: any): Promise<string> {
	const options = normalizeDialogOptions(arg, {
		title: '',
		message: '',
		cancelButtonText: DialogStrings.CANCEL,
		actions: [],
	});
	const actions = Array.isArray(options.actions) ? options.actions : [];
	const buttons = [...actions, options.cancelButtonText];
	const result = runModalAlert(options.title, options.message, buttons);
	const index = result - NSAlertFirstButtonReturn;
	return Promise.resolve(buttons[index] ?? options.cancelButtonText);
}

export function getCurrentPage() {
	return null;
}

export const Dialogs = {
	alert,
	confirm,
	prompt,
	login,
	action,
};
