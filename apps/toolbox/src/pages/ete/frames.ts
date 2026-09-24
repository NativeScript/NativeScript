import { EventData, Frame, Page, SafeArea } from '@nativescript/core';

// Opt in before the outer frame builds page 1, so it measures with tracking on.
SafeArea.trackConsumption = true;

// Walks the outer frame through every page so the repro reports itself without taps.
export function navigatedTo(args: EventData) {
	const page = <Page>args.object;
	const outer = page.getViewById<Frame>('outer');

	setTimeout(() => outer?.navigate('pages/ete/frames-p2'), 2500);
	setTimeout(() => outer?.navigate('pages/ete/frames-p3'), 5000);
}
