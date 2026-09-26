import { EventData, Page } from '@nativescript/core';
import { setupPage } from './nested-tab-frame-shared';

export function navigatingTo(args: EventData) {
	setupPage(<Page>args.object, { tabCount: 4 });
}
