/* tslint:disable:no-unused-variable */
/* tslint:disable:no-empty */
import { ControlStateChangeListener as ControlStateChangeListenerDefinition } from '.';

export class ControlStateChangeListener implements ControlStateChangeListenerDefinition {
	constructor(control: any /* UIControl */, callback: (state: string, add: boolean) => void) {
		console.log('ControlStateChangeListener is intended for IOS usage only.');
	}
	public start() {}
	public stop() {}
}
