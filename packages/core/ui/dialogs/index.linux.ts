export * from './dialogs-common';

import { type PromptResult, type LoginResult, DialogStrings, isDialogOptions, parseLoginOptions } from './dialogs-common';

const letterReg = /\p{L}/u;
const digitReg = /\p{Nd}/u;
const whiteSpaceReg = /\s/;

export const isLetter = (ch: string) => letterReg.test(ch);
export const isDigit = (ch: string) => digitReg.test(ch);
export const isWhiteSpace = (ch: string) => whiteSpaceReg.test(ch);

// TODO(linux): GTK dialogs; placeholders log and resolve with defaults.
export function alert(arg: any): Promise<void> {
	console.log(isDialogOptions(arg) ? arg.message : arg);
	return Promise.resolve();
}

export function confirm(arg: any): Promise<boolean> {
	console.log(isDialogOptions(arg) ? arg.message : arg);
	return Promise.resolve(false);
}

export function prompt(...args: any[]): Promise<PromptResult> {
	return Promise.resolve({ result: false, text: '' });
}

export function login(...args: any[]): Promise<LoginResult> {
	parseLoginOptions(args);
	return Promise.resolve({ result: false, userName: '', password: '' });
}

export function action(...args: any[]): Promise<string> {
	return Promise.resolve(DialogStrings.CANCEL);
}

export const Dialogs = { alert, confirm, prompt, login, action };
