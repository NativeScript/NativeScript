import { Observable, EventData, Page, CoreTypes, GlassEffectConfig } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new GlassEffectModel();
}

export class GlassEffectModel extends Observable {
	iosGlassEffectInteractive: GlassEffectConfig = {
		interactive: true,
		tint: '#faabab',
		variant: 'clear',
	};
}
