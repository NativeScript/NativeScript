﻿/* tslint:disable:no-unused-variable */
/* tslint:disable:no-empty */
import { ControlStateChangeListenerCallback, ControlStateChangeListener as ControlStateChangeListenerDefinition } from '.';

export class ControlStateChangeListener implements ControlStateChangeListenerDefinition {
	constructor(control: any /* UIControl */, states: string[], callback: ControlStateChangeListenerCallback) {
		console.log('ControlStateChangeListener is intended for IOS usage only.');
	}
	public start() {}
	public stop() {}
}
