import { Event, EVENT_OPTIONS_DEFAULT } from './Event';

export class CustomEvent extends Event {
	_details: any;
	constructor(type: string, { bubbles, captures, cancelable, composed, detail } = EVENT_OPTIONS_DEFAULT as typeof EVENT_OPTIONS_DEFAULT & { detail: any }) {
		super(type, { bubbles, captures, cancelable, composed });
		this._details = detail;
	}
	initCustomEvent() {}
	get detail() {
		return this._details;
	}
}
