import * as dialogs from '@nativescript/core/ui/dialogs';
import * as observable from '@nativescript/core/data/observable';

var name = 'Harold Finch';

export class SettingsViewModel extends observable.Observable {
	get name(): string {
		return name;
	}

	set name(value: string) {
		name = value;
	}

	public actionName(args: observable.EventData) {
		dialogs
			.action({
				message: 'Change the name?',
				cancelButtonText: 'Close',
				actions: ['Yes', 'No'],
			})
			.then((actionResult) => {
				console.log('### Result: ' + actionResult);
				if (actionResult === 'Yes') {
					this.set('name', 'John Reese');
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public alertName(args: observable.EventData) {
		dialogs
			.alert({
				title: 'Name',
				message: 'The name will change.',
				okButtonText: 'OK',
			})
			.then((alertResult) => {
				console.log('### Result: ' + alertResult);
				this.set('name', 'John Reese');
			});
	}

	public confirmName(args: observable.EventData) {
		dialogs
			.confirm({
				title: 'Name',
				message: 'Do you want to change the name?',
				cancelButtonText: 'No',
				neutralButtonText: 'Ignore',
				okButtonText: 'Yes',
			})
			.then((confirmResult) => {
				console.log('### Result: ' + confirmResult);
				if (confirmResult) {
					this.set('name', 'John Reese');
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public loginName(args: observable.EventData) {
		dialogs
			.login({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				userName: 'John',
				password: 'Reese',
			})
			.then((loginResult) => {
				console.log('### Result: ' + loginResult.result + ', UserName: ' + loginResult.userName + ', Password: ' + loginResult.password);
				if (loginResult.result) {
					this.set('name', loginResult.userName + ' ' + loginResult.password);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptText(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: 'John Reese',
				inputType: dialogs.inputType.text,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptPass(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: 'John Reese',
				inputType: dialogs.inputType.password,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptEmail(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter email:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: 'john.reese@nativescript.org',
				inputType: dialogs.inputType.email,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptNumber(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter a number:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: '1234',
				inputType: dialogs.inputType.number,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', '1234');
				}
			});
	}

	public promptDecimal(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter a decimal number:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: '13.50',
				inputType: dialogs.inputType.decimal,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', '13.50');
				}
			});
	}

	public promptPhone(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter a phone:',
				cancelButtonText: 'Cancel',
				neutralButtonText: 'Ignore',
				okButtonText: 'OK',
				defaultText: '1234',
				inputType: dialogs.inputType.phone,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', '1234');
				}
			});
	}

	public promptCapitalizationNone(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				okButtonText: 'OK',
				inputType: dialogs.inputType.text,
				capitalizationType: dialogs.capitalizationType.none,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptCapitalizationAll(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				okButtonText: 'OK',
				inputType: dialogs.inputType.text,
				capitalizationType: dialogs.capitalizationType.all,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptCapitalizationSentences(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				okButtonText: 'OK',
				inputType: dialogs.inputType.text,
				capitalizationType: dialogs.capitalizationType.sentences,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}

	public promptCapitalizationWords(args: observable.EventData) {
		dialogs
			.prompt({
				title: 'Name',
				message: 'Enter name:',
				cancelButtonText: 'Cancel',
				okButtonText: 'OK',
				inputType: dialogs.inputType.text,
				capitalizationType: dialogs.capitalizationType.words,
			})
			.then((promptResult) => {
				console.log('### Result: ' + promptResult.result + ', Text: ' + promptResult.text);
				if (promptResult.result) {
					this.set('name', promptResult.text);
				} else {
					this.set('name', 'Harold Finch');
				}
			});
	}
}
export var settingsViewModel = new SettingsViewModel();
