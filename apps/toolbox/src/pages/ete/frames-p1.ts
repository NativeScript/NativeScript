import { EventData, Page } from '@nativescript/core';
import { FramesProbe } from './frames-shared';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new FramesProbe(page, 'page 1 - no scroll', 'line-p1');
}
