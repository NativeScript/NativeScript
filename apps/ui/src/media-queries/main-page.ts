import { Button } from '@nativescript/core';
import { EventData } from '@nativescript/core/data/observable';
import { Observable } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';

export function onNavigatedTo(args: EventData) {
	const page = <Page>args.object;

	const orientationButton: Button = page.getViewById('orientation-match-media-btn');
	if (orientationButton) {
		const mq = matchMedia('(orientation: portrait)');
		let mode = mq.matches ? 'portrait' : 'landscape';

		orientationButton.text = `I' m in ${mode} mode!`;

		mq.addEventListener('change', (event: MediaQueryListEvent) => {
			mode = event.matches ? 'portrait' : 'landscape';
			orientationButton.text = `I' m in ${mode} mode!`;
		});
	}

	const themeModeButton: Button = page.getViewById('theme-match-media-btn');
	if (themeModeButton) {
		const mq = matchMedia('(prefers-color-scheme: light)');
		let mode = mq.matches ? 'light' : 'dark';

		themeModeButton.text = `I' m in ${mode} mode!`;

		mq.addEventListener('change', (event: MediaQueryListEvent) => {
			mode = event.matches ? 'light' : 'dark';
			themeModeButton.text = `I' m in ${mode} mode!`;
		});
	}
}
