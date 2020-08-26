// >> dialog-require
import { Dialogs, PromptResult, LoginResult, inputType } from '@nativescript/core';
// << dialog-require

export function test_DummyTestForSnippetOnly0() {
	// >> dialog-action
	var options = {
		title: 'Race Selection',
		message: 'Choose your race',
		cancelButtonText: 'Cancel',
		actions: ['Human', 'Elf', 'Dwarf', 'Orc'],
	};
	Dialogs.action(options).then((result) => {
		console.log(result);
	});
	// << dialog-action
}

export function test_DummyTestForSnippetOnly1() {
	// >> dialog-confirm
	var options = {
		title: 'Race Selection',
		message: 'Are you sure you want to be an Elf?',
		okButtonText: 'Yes',
		cancelButtonText: 'No',
		neutralButtonText: 'Cancel',
	};
	Dialogs.confirm(options).then((result: boolean) => {
		// result can be true/false/undefined
		console.log(result);
	});
	// << dialog-confirm
}

export function test_DummyTestForSnippetOnly2() {
	// >> dialog-alert
	var options = {
		title: 'Race Selection',
		message: 'Race Chosen: Elf',
		okButtonText: 'OK',
	};
	Dialogs.alert(options).then(() => {
		console.log('Race Chosen!');
	});
	// << dialog-alert
}

export function test_DummyTestForSnippetOnly3() {
	// >> dialog-login
	var options = {
		title: 'Login',
		message: 'Login',
		username: 'john_doe',
		password: '',
	};
	Dialogs.login(options).then((loginResult: LoginResult) => {
		// true or false.
		console.log(loginResult.result);
	});
	// << dialog-login
}

export function test_DummyTestForSnippetOnly4() {
	// >> dialog-prompt
	var options = {
		title: 'Name',
		defaultText: 'Enter your name',
		inputType: inputType.text,
	};
	Dialogs.prompt(options).then((result: PromptResult) => {
		console.log('Hello, ' + result.text);
	});
	// << dialog-prompt
}
