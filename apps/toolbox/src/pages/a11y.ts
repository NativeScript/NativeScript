import { Observable, EventData, Page } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new AccessibilityModel();
}

export class AccessibilityModel extends Observable {}
