import { EventData, Frame, Observable, Page } from '@nativescript/core';
import { readEdges } from './shared';

class Modals extends Observable {
	constructor(private page: Page) {
		super();
		this.set('lastResult', 'no modal opened yet');
	}

	private show(fullscreen: boolean, edge: string) {
		this.page.showModal('pages/ete/modal-content', {
			context: { fullscreen, edge },
			fullscreen,
			closeCallback: (summary: string) => this.set('lastResult', summary ?? 'closed'),
		});
	}

	openFullscreenNone = () => this.show(true, 'none');
	openFullscreenBottom = () => this.show(true, 'bottom');
	openDialog = () => this.show(false, 'none');

	back = () => {
		Frame.topmost().goBack();
	};
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new Modals(page);
	setTimeout(() => page.bindingContext.set('probe', readEdges(page.getViewById('probe')).padding), 80);
}
